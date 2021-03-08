import {
    ActionResultEvent,
    AskPriceStrategy,
    DirectBuy,
    MatchingEngine,
    OrderCreationTimePickStrategy,
    Trade,
    TradeExecutedEvent
} from '@energyweb/exchange-core';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';
import { List } from 'immutable';

import { IOrderMapperService } from '../../interfaces/IOrderMapperService';
import { OrderType } from '../order/order-type.enum';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { BulkTradeExecutedEvent } from './bulk-trade-executed.event';

@Injectable()
export class MatchingEngineService<TProduct, TProductFilter> implements OnModuleInit {
    private initialized = false;

    private readonly logger = new Logger(MatchingEngineService.name);

    private matchingEngine: MatchingEngine<TProduct, TProductFilter>;

    private orderMapperService: IOrderMapperService<TProduct, TProductFilter>;

    constructor(
        private readonly orderService: OrderService<TProduct>,
        private readonly eventBus: EventBus,
        private readonly config: ConfigService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit(): Promise<void> {
        this.orderMapperService = this.moduleRef.get<IOrderMapperService<TProduct, TProductFilter>>(
            IOrderMapperService,
            {
                strict: false
            }
        );

        const priceStrategyIndex = this.config.get<number>('EXCHANGE_PRICE_STRATEGY');
        const priceStrategy =
            priceStrategyIndex === 0 ? new AskPriceStrategy() : new OrderCreationTimePickStrategy();

        if (priceStrategy === undefined) {
            throw new Error('EXCHANGE_PRICE_STRATEGY is not set');
        }

        this.logger.log(
            `Initializing matching engine with ${priceStrategy.constructor.name} strategy`
        );
        this.matchingEngine = new MatchingEngine(priceStrategy);

        await this.initTrades();

        this.matchingEngine.trades.subscribe(async (trades) => this.onTradeExecutedEvent(trades));
        this.matchingEngine.actionResults.subscribe(async (actionResultEvents) =>
            this.onActionResultEvent(actionResultEvents)
        );

        this.initialized = true;
    }

    public async submit(order: Order) {
        this.logger.log(`Submitting order ${order.id}`);
        this.logger.debug(`Submitting order ${JSON.stringify(order)}`);

        if (order.type === OrderType.Limit) {
            const mappedOrder = await this.orderMapperService.map(order);

            this.matchingEngine.submitOrder(mappedOrder);
        } else if (order.type === OrderType.Direct) {
            this.matchingEngine.submitDirectBuy(this.toDirectBuy(order));
        }
    }

    public query(productFilter: TProductFilter) {
        return this.matchingEngine.orderBookByProduct(productFilter);
    }

    public cancel(orderId: string) {
        this.matchingEngine.cancelOrder(orderId);
    }

    public async clear(): Promise<void> {
        this.matchingEngine.clear();

        await this.initTrades();
    }

    @Interval(Number(process.env.EXCHANGE_MATCHING_INTERVAL) || 1000)
    private executeMatching() {
        if (!this.initialized) {
            return;
        }

        this.matchingEngine.tick();
    }

    private async initTrades(): Promise<void> {
        const orders = await this.orderService.getAllActiveOrders();
        this.logger.log(`Submitting ${orders.length} existing orders`);

        for (const order of orders) {
            this.logger.log(`Submitting order ${order.id}`);

            const mappedOrder = await this.orderMapperService.map(order);

            this.matchingEngine.submitOrder(mappedOrder);
        }
    }

    private async onTradeExecutedEvent(tradeEvents: List<TradeExecutedEvent>) {
        this.logger.log('Received TradeExecutedEvent event');

        const trades = tradeEvents.map<Trade>((t) => t.trade);

        this.eventBus.publish(new BulkTradeExecutedEvent(trades));
    }

    private async onActionResultEvent(statusChanges: List<ActionResultEvent>) {
        this.logger.log('Received StatusChangedEvent event');
        this.logger.log(`Received StatusChangedEvent event ${JSON.stringify(statusChanges)}`);

        await this.orderService.persistOrderStatusChange(statusChanges);
    }

    private toDirectBuy(order: Order) {
        return new DirectBuy(
            order.id,
            order.userId,
            order.price,
            order.startVolume,
            order.directBuyId,
            order.createdAt
        );
    }
}
