import {
    ActionResultEvent,
    Ask,
    Bid,
    DirectBuy,
    MatchingEngine,
    OrderSide,
    ProductFilter,
    TradeExecutedEvent
} from '@energyweb/exchange-core';
import { LocationService } from '@energyweb/utils-general';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { List } from 'immutable';

import { OrderType } from '../order/order-type.enum';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { ProductDTO } from '../order/product.dto';
import { DeviceTypeServiceWrapper } from '../runner/deviceTypeServiceWrapper';
import { TradeService } from '../trade/trade.service';

@Injectable()
export class MatchingEngineService implements OnModuleInit {
    private initialized = false;

    private readonly logger = new Logger(MatchingEngineService.name);

    private matchingEngine: MatchingEngine;

    constructor(
        private readonly tradeService: TradeService,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService,
        private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper
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

            this.matchingEngine.submitOrder(this.toOrder(order));
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
            this.matchingEngine.submitOrder(this.toOrder(order));
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

    @Interval(1000)
    private executeMatching() {
        if (!this.initialized) {
            return;
        }

        this.logger.debug('Triggering matching engine');
        this.matchingEngine.tick();
    }

    private async onTradeExecutedEvent(trades: List<TradeExecutedEvent>) {
        this.logger.log('Received TradeExecutedEvent event');

        await this.tradeService.persist(trades);
    }

    private async onActionResultEvent(statusChanges: List<ActionResultEvent>) {
        this.logger.log('Received StatusChangedEvent event');
        this.logger.log(`Received StatusChangedEvent event ${JSON.stringify(statusChanges)}`);

        await this.orderService.persistOrderStatusChange(statusChanges);
    }

    private toOrder(order: Order) {
        return order.side === OrderSide.Ask
            ? new Ask(
                  order.id,
                  order.price,
                  order.currentVolume,
                  ProductDTO.toProduct(order.product),
                  order.validFrom,
                  order.userId,
                  order.assetId
              )
            : new Bid(
                  order.id,
                  order.price,
                  order.currentVolume,
                  ProductDTO.toProduct(order.product),
                  order.validFrom,
                  order.userId
              );
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
