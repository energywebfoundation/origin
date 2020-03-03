import {
    Ask,
    Bid,
    MatchingEngine,
    OrderSide,
    Product,
    TradeExecutedEvent
} from '@energyweb/exchange-core';
import { DeviceTypeService, LocationService } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { List } from 'immutable';

import { Order } from '../order/order.entity';
import { TradeService } from '../trade/trade.service';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class MatchingEngineService {
    private initialized = false;

    private readonly logger = new Logger(MatchingEngineService.name);

    private matchingEngine: MatchingEngine;

    constructor(private readonly tradeService: TradeService) {}

    public init(orders: Order[], deviceTypes: string[][]) {
        this.logger.log(`Initializing matching engine`);
        this.logger.log(`Submitting ${orders.length}`);

        this.matchingEngine = new MatchingEngine(
            new DeviceTypeService(deviceTypes),
            new LocationService()
        );

        orders.forEach(order => {
            this.logger.log(`Submitting order ${order.id}`);

            this.matchingEngine.submitOrder(this.toOrder(order));
        });

        this.matchingEngine.trades.subscribe(async trades => this.onTradeExecutedEvent(trades));

        this.initialized = true;
    }

    public submit(order: Order) {
        this.logger.log(`Submitting order ${order.id}`);
        this.logger.debug(`Submitting order ${JSON.stringify(order)}`);

        this.matchingEngine.submitOrder(this.toOrder(order));
    }

    public query(product: Product) {
        // TODO: consider reading this info from DB and filtering
        return this.matchingEngine.orderBookByProduct(product);
    }

    @Interval(1000)
    private executeMatching() {
        if (!this.initialized) {
            return;
        }

        this.logger.log('Triggering matching engine');
        this.matchingEngine.tick();
    }

    private async onTradeExecutedEvent(trades: List<TradeExecutedEvent>) {
        this.logger.log('Received TradeExecutedEvent event');

        await this.tradeService.persist(trades);
    }

    private toOrder(order: Order) {
        return order.side === OrderSide.Ask
            ? new Ask(
                  order.id,
                  order.price,
                  order.currentVolume,
                  ProductDTO.toProduct(order.product),
                  order.validFrom,
                  order.status,
                  order.userId
              )
            : new Bid(
                  order.id,
                  order.price,
                  order.currentVolume,
                  ProductDTO.toProduct(order.product),
                  order.validFrom,
                  order.status,
                  order.userId
              );
    }
}
