import { Ask, Bid, ProductFilter, TradeExecutedEvent } from '@energyweb/exchange-core';
import { IDeviceTypeService, LocationService } from '@energyweb/utils-general';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from 'immutable';
import { Connection, Repository } from 'typeorm';

import { toMatchingEngineOrder } from '../matching-engine/order-mapper';
import { OrderStatus } from '../order/order-status.enum';
import { Order } from '../order/order.entity';
import { DeviceTypeServiceWrapper } from '../runner/deviceTypeServiceWrapper';
import { Trade } from './trade.entity';

type TradeCacheItem = {
    ask: Ask;
    bid: Bid;
    price: number;
};

@Injectable()
export class TradeService implements OnModuleInit {
    private readonly logger = new Logger(TradeService.name);

    private readonly locationService = new LocationService();

    private deviceTypeService: IDeviceTypeService;

    private tradeCache: TradeCacheItem[];

    constructor(
        private readonly connection: Connection,
        @InjectRepository(Trade)
        private readonly repository: Repository<Trade>,
        private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper
    ) {}

    public async onModuleInit() {
        this.logger.log(`Initializing trade service`);
        this.deviceTypeService = this.deviceTypeServiceWrapper.deviceTypeService;

        await this.loadTradesCache();
    }

    public async persist(event: List<TradeExecutedEvent>) {
        this.logger.log(`Persisting trades and updating orders: ${event.size}`);
        this.logger.debug(`Persisting trades and updating orders: ${JSON.stringify(event)}`);

        const trades: string[] = [];

        await this.connection.transaction(async (entityManager) => {
            for (const { bid, ask, trade } of event) {
                await entityManager.update<Order>(Order, ask.id, {
                    currentVolume: ask.volume,
                    status: ask.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });

                const tradeToStore = new Trade({
                    created: trade.created,
                    price: trade.price,
                    volume: trade.volume,
                    bid: { id: bid.id } as Order,
                    ask: { id: ask.id } as Order
                });
                await entityManager.insert<Trade>(Trade, tradeToStore);

                trades.push(tradeToStore.id);
            }
            this.logger.debug(`Persisting trades and orders completed`);
        });

        await this.updateTradesCache(trades);
    }

    public getLastTradedPrice(productFilter: ProductFilter) {
        this.logger.debug(`Finding last traded price for ${JSON.stringify(productFilter)}`);

        const lastTrade = this.tradeCache.find(({ ask, bid }) => {
            return (
                ask.filterBy(productFilter, this.deviceTypeService, this.locationService) &&
                bid.filterBy(productFilter, this.deviceTypeService, this.locationService)
            );
        });

        return lastTrade?.price;
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

    private toTradeCacheItem(trade: Trade): TradeCacheItem {
        return {
            ask: toMatchingEngineOrder({
                ...trade.ask,
                currentVolume: trade.ask.startVolume
            } as Order) as Ask,
            bid: toMatchingEngineOrder({
                ...trade.bid,
                currentVolume: trade.bid.startVolume
            } as Order) as Bid,
            price: trade.price
        };
    }

    private async updateTradesCache(tradeIds: string[]) {
        this.logger.debug(`Updating trades cache with trade ${tradeIds}`);
        const trades = await this.repository.findByIds(tradeIds, { order: { created: 'DESC' } });
        const cacheItems = trades.map((trade) => this.toTradeCacheItem(trade));

        this.tradeCache = [...cacheItems, ...this.tradeCache];
    }
}
