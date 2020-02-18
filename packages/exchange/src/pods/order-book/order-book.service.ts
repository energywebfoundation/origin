import { Product, Order } from '@energyweb/exchange-core';
import { Injectable } from '@nestjs/common';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { OrderBookOrderDTO } from './order-book-order.dto';

@Injectable()
export class OrderBookService {
    constructor(private readonly matchingEngineService: MatchingEngineService) {}

    public getByProduct(
        product: Product
    ): { asks: OrderBookOrderDTO[]; bids: OrderBookOrderDTO[] } {
        const { asks, bids } = this.matchingEngineService.query(product);
        const toOrderBookOrderDTO = (order: Order) => ({
            price: order.price,
            volume: order.volume.toString(10),
            product: order.product
        });

        return {
            asks: asks.map(ask => toOrderBookOrderDTO(ask)).toArray(),
            bids: bids.map(bid => toOrderBookOrderDTO(bid)).toArray()
        };
    }
}
