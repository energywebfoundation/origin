import { Ask, Bid, ProductFilter, Trade, OrderStatus } from '@energyweb/exchange-core';
import { LocationService } from '@energyweb/utils-general';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { List } from 'immutable';
import { Connection, Repository } from 'typeorm';

import { toMatchingEngineOrder } from '../matching-engine/order-mapper';
import { Order } from '../order/order.entity';
import { ProductDTO } from '../order/product.dto';
import { DeviceTypeServiceWrapper } from '../runner/deviceTypeServiceWrapper';
import { TradePriceInfoDTO } from './trade-price-info.dto';
import { Trade as TradeEntity } from './trade.entity';

type TradeCacheItem = {
    ask: Ask;
    bid: Bid;
    price: number;
    product: ProductDTO;
    volume: BN;
    created: Date;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class TradeService implements OnModuleInit {
    private readonly logger = new Logger(TradeService.name);

    private readonly locationService = new LocationService();

    private tradeCache: TradeCacheItem[];

    constructor(
        private readonly connection: Connection,
        @InjectRepository(TradeEntity)
        private readonly repository: Repository<TradeEntity>,
        private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper,
        private readonly eventBus: EventBus
    ) {}

    public async onModuleInit() {
        this.logger.log(`Initializing trade service`);

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
                    status: ask.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
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

    public getLastTradedPrice(productFilter: ProductFilter): TradePriceInfoDTO {
        this.logger.debug(`Finding last traded price for ${JSON.stringify(productFilter)}`);

        const lastTrade = this.tradeCache.find(({ ask, bid }) => {
            return (
                ask.filterBy(
                    productFilter,
                    this.deviceTypeServiceWrapper.deviceTypeService,
                    this.locationService
                ) &&
                bid.filterBy(
                    productFilter,
                    this.deviceTypeServiceWrapper.deviceTypeService,
                    this.locationService
                )
            );
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

        this.tradeCache = trades.map((trade) => this.toTradeCacheItem(trade));
    }

    private toTradeCacheItem(trade: TradeEntity): TradeCacheItem {
        return {
            ask: toMatchingEngineOrder({
                ...trade.ask,
                currentVolume: trade.ask.startVolume
            } as Order) as Ask,
            bid: toMatchingEngineOrder({
                ...trade.bid,
                currentVolume: trade.bid.startVolume
            } as Order) as Bid,
            price: trade.price,
            created: trade.created,
            volume: trade.volume,
            product: trade.ask.product
        };
    }

    private async handlePersistedTrades(tradeIds: string[]) {
        this.logger.debug(`Updating trades cache with trade ${tradeIds}`);
        const trades = await this.repository.findByIds(tradeIds, { order: { created: 'DESC' } });

        this.updateCache(trades);
        this.emitTradePersistedEvents(trades);
    }

    private updateCache(trades: TradeEntity[]) {
        const cacheItems = trades.map((trade) => this.toTradeCacheItem(trade));

        this.tradeCache = [...cacheItems, ...this.tradeCache];
    }

    private emitTradePersistedEvents(trades: TradeEntity[]) {
        this.eventBus.publishAll(trades);
    }
}
