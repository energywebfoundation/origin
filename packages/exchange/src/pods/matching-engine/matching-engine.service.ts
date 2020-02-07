import {
    Ask,
    Bid,
    DeviceVintage,
    MatchingEngine,
    OrderSide,
    TradeExecutedEvent,
    Product
} from '@energyweb/exchange-core';
import { DeviceTypeService, LocationService } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { List } from 'immutable';

import { Order as OrderEntity } from '../order/order.entity';
import { TradeService } from '../trade/trade.service';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class MatchingEngineService {
    private initialized = false;

    private readonly logger = new Logger(MatchingEngineService.name);

    private readonly matchingEngine = new MatchingEngine(
        new DeviceTypeService([]),
        new LocationService()
    );

    constructor(private readonly tradeService: TradeService) {}

    public async init(orders: OrderEntity[]) {
        this.logger.log(`Initializing matching engine`);
        this.logger.log(`Submitting ${orders.length}`);

        orders.forEach(order => {
            this.logger.log(`Submitting order ${order.id}`);
            this.matchingEngine.submitOrder(this.toOrder(order));
        });

        this.matchingEngine.trades.subscribe(trades => this.onTradeExecutedEvent(trades));

        this.initialized = true;
    }

    public submit(orderEntity: OrderEntity) {
        this.logger.log('Submitting order ', orderEntity.id);

        const order = this.toOrder(orderEntity);
        this.matchingEngine.submitOrder(order);
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

    private toOrder(order: OrderEntity) {
        return order.side === OrderSide.Ask
            ? new Ask(
                  order.id,
                  order.price,
                  order.currentVolume,
                  this.toProduct(order.product),
                  order.validFrom,
                  order.status
              )
            : new Bid(
                  order.id,
                  order.price,
                  order.currentVolume,
                  this.toProduct(order.product),
                  order.validFrom,
                  order.status
              );
    }

    private toProduct(product: ProductDTO): Product {
        return {
            ...product,
            deviceVintage: new DeviceVintage(
                product.deviceVintage.year,
                product.deviceVintage.operator
            )
        };
    }
}
