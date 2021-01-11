import { IMatchableOrder, OrderStatus, Trade } from '@energyweb/exchange-core';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { List } from 'immutable';
import { Connection, Repository } from 'typeorm';

import { IOrderMapperService } from '../../interfaces/IOrderMapperService';
import { Order } from '../order/order.entity';
import { TradePersistedEvent } from './trade-persisted.event';
import { TradePriceInfoDTO } from './trade-price-info.dto';
import { Trade as TradeEntity } from './trade.entity';

type TradeCacheItem<TProduct, TProductFilter> = {
    ask: IMatchableOrder<TProduct, TProductFilter>;
    bid: IMatchableOrder<TProduct, TProductFilter>;
    price: number;
    product: any;
    volume: BN;
    created: Date;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class TradeService<TProduct, TProductFilter> implements OnModuleInit {
    private readonly logger = new Logger(TradeService.name);

    private tradeCache: TradeCacheItem<TProduct, TProductFilter>[];

    private orderMapperService: IOrderMapperService<TProduct, TProductFilter>;

    constructor(
        private readonly connection: Connection,
        @InjectRepository(TradeEntity)
        private readonly repository: Repository<TradeEntity>,
        private readonly eventBus: EventBus,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit() {
        this.logger.log(`Initializing trade service`);

        this.orderMapperService = this.moduleRef.get<IOrderMapperService<TProduct, TProductFilter>>(
            IOrderMapperService,
            {
                strict: false
            }
        );

        await this.loadTradesCache();
    }

    public async persist(event: List<Trade>) {
        this.logger.log(`Persisting trades and updating orders: ${event.size}`);
        this.logger.debug(`Persisting trades and updating orders: ${JSON.stringify(event)}`);

        const trades: string[] = [];

        await this.connection.transaction(async (entityManager) => {
            for (const trade of event) {
                const { ask, bid } = trade;
                await entityManager.update<Order>(Order, ask.id, {
                    currentVolume: ask.volume,
                    status: ask.isFilled ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.isFilled ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });

                const tradeToStore = new TradeEntity({
                    created: new Date(),
                    price: trade.price,
                    volume: trade.volume,
                    bid: { id: bid.id } as Order,
                    ask: { id: ask.id } as Order
                });
                await entityManager.insert<TradeEntity>(TradeEntity, tradeToStore);

                trades.push(tradeToStore.id);

                // This is to force each trade have unique created timestamp making the trades order deterministic
                await sleep(1);
            }
            this.logger.debug(`Persisting trades and orders completed`);
        });

        await this.handlePersistedTrades(trades);
    }

    public getLastTradedPrice(productFilter: TProductFilter): TradePriceInfoDTO<TProduct> {
        this.logger.debug(`Finding last traded price for ${JSON.stringify(productFilter)}`);

        const lastTrade = this.tradeCache.find(({ ask, bid }) => {
            return ask.filterBy(productFilter) && bid.filterBy(productFilter);
        });

        return new TradePriceInfoDTO({
            price: lastTrade?.price,
            created: lastTrade?.created,
            volume: lastTrade?.volume,
            product: lastTrade?.product,
            assetId: lastTrade?.ask.assetId
        });
    }

    private async getAll() {
        return this.buildGetAllQuery().orderBy('trade.created', 'DESC').getMany();
    }

    public async getAllByUser(userId: string, maskOrders = true) {
        const trades = await this.buildGetAllQuery()
            .where('ask.userId = :userId OR bid.userId = :userId', { userId })
            .getMany();

        return maskOrders ? trades.map((trade) => trade.withMaskedOrder(userId)) : trades;
    }

    private buildGetAllQuery() {
        return this.repository
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.bid', 'bid')
            .leftJoinAndSelect('trade.ask', 'ask')
            .leftJoinAndSelect('ask.asset', 'asset');
    }

    private async loadTradesCache() {
        this.logger.debug(`Loading trades cache`);

        const trades = await this.getAll();

        this.logger.debug(`Found ${trades.length} trades to load`);

        this.tradeCache = await Promise.all(trades.map((trade) => this.toTradeCacheItem(trade)));
    }

    private async toTradeCacheItem(
        trade: TradeEntity
    ): Promise<TradeCacheItem<TProduct, TProductFilter>> {
        const ask = await this.orderMapperService.map({
            ...trade.ask,
            currentVolume: trade.ask.startVolume
        } as Order);

        const bid = await this.orderMapperService.map({
            ...trade.bid,
            currentVolume: trade.bid.startVolume
        } as Order);

        return {
            ask,
            bid,
            price: trade.price,
            created: trade.created,
            volume: trade.volume,
            product: trade.ask.product
        };
    }

    private async handlePersistedTrades(tradeIds: string[]) {
        this.logger.debug(`Updating trades cache with trade ${tradeIds}`);
        const trades = await this.repository.findByIds(tradeIds, { order: { created: 'DESC' } });

        await this.updateCache(trades);
        this.emitTradePersistedEvents(trades);
    }

    private async updateCache(trades: TradeEntity[]) {
        const cacheItems = await Promise.all(trades.map((trade) => this.toTradeCacheItem(trade)));

        this.tradeCache = [...cacheItems, ...this.tradeCache];
    }

    private emitTradePersistedEvents(trades: TradeEntity[]) {
        this.eventBus.publishAll(trades.map((trade) => new TradePersistedEvent(trade)));
    }
}
