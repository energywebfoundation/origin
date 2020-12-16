import { MatchingEngineService, TradeService } from '@energyweb/exchange';
import { IRECProduct, IRECProductFilter } from '@energyweb/exchange-core-irec';
import { Injectable } from '@nestjs/common';

import { OrderBookOrderDTO } from '.';
import { ProductFilterDTO } from '../product';

@Injectable()
export class OrderBookService {
    constructor(
        private readonly matchingEngineService: MatchingEngineService<
            IRECProduct,
            IRECProductFilter
        >,
        private readonly tradeService: TradeService<IRECProduct, IRECProductFilter>
    ) {}

    public getByProduct(productFilterDTO: ProductFilterDTO, userId?: string) {
        const productFilter = ProductFilterDTO.toProductFilter(productFilterDTO);
        const { asks, bids } = this.matchingEngineService.query(productFilter);
        const lastTradedPrice = this.tradeService.getLastTradedPrice(productFilter);

        return {
            asks: asks.map((ask) => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map((bid) => OrderBookOrderDTO.fromOrder(bid, userId)).toArray(),
            lastTradedPrice
        };
    }
}
