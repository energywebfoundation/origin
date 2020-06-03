import {
    ActionResultEvent,
    DirectBuy,
    MatchingEngine,
    ProductFilter,
    TradeExecutedEvent
} from '@energyweb/exchange-core';
import { LocationService } from '@energyweb/utils-general';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';
import { List } from 'immutable';

import { OrderType } from '../order/order-type.enum';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { DeviceTypeServiceWrapper } from '../runner/deviceTypeServiceWrapper';
import { toMatchingEngineOrder } from './order-mapper';
import { BulkTradeExecutedEvent } from './bulk-trade-executed.event';

@Injectable()
export class MatchingEngineService implements OnModuleInit {
    private initialized = false;

    private readonly logger = new Logger(MatchingEngineService.name);

    private matchingEngine: MatchingEngine;

    constructor(
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService,
        private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper,
        private readonly eventBus: EventBus
    ) {}

    public async onModuleInit() {
        this.logger.log(`Initializing matching engine`);

        const orders = await this.orderService.getAllActiveOrders();
        this.logger.log(`Submitting ${orders.length} existing orders`);

        this.matchingEngine = new MatchingEngine(
            this.deviceTypeServiceWrapper.deviceTypeService,
            new LocationService()
        );

        orders.forEach((order) => {
            this.logger.log(`Submitting order ${order.id}`);

            this.matchingEngine.submitOrder(toMatchingEngineOrder(order));
        });

        this.matchingEngine.trades.subscribe(async (trades) => this.onTradeExecutedEvent(trades));
        this.matchingEngine.actionResults.subscribe(async (actionResultEvents) =>
            this.onActionResultEvent(actionResultEvents)
        );

        this.initialized = true;
    }

    public submit(order: Order) {
        this.logger.log(`Submitting order ${order.id}`);
        this.logger.debug(`Submitting order ${JSON.stringify(order)}`);

        if (order.type === OrderType.Limit) {
            this.matchingEngine.submitOrder(toMatchingEngineOrder(order));
        } else if (order.type === OrderType.Direct) {
            this.matchingEngine.submitDirectBuy(this.toDirectBuy(order));
        }
    }

    public query(productFilter: ProductFilter) {
        return this.matchingEngine.orderBookByProduct(productFilter);
    }

    public cancel(orderId: string) {
        this.matchingEngine.cancelOrder(orderId);
    }

    @Interval(Number(process.env.EXCHANGE_MATCHING_INTERVAL) || 1000)
    private executeMatching() {
        if (!this.initialized) {
            return;
        }

        this.matchingEngine.tick();
    }

    private async onTradeExecutedEvent(trades: List<TradeExecutedEvent>) {
        this.logger.log('Received TradeExecutedEvent event');

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
            order.directBuyId
        );
    }
}
