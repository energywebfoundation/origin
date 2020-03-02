import { Product } from '@energyweb/exchange-core';
import { Injectable } from '@nestjs/common';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';

@Injectable()
export class OrderBookService {
    constructor(private readonly matchingEngineService: MatchingEngineService) {}

    public getByProduct(product: Product) {
        return this.matchingEngineService.query(product);
    }
}
