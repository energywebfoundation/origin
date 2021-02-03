import { IMatchableOrder, Order as MatchingEngineOrder } from '@energyweb/exchange-core';
import { Injectable, Logger } from '@nestjs/common';

import { IOrderMapperService } from '../../src/interfaces';
import { Order } from '../../src/pods/order/order.entity';
import { MatchableProduct } from './matchable-product';

@Injectable()
export class OrderMapperService implements IOrderMapperService<string, string> {
    private readonly logger = new Logger(OrderMapperService.name);

    private readonly testProduct = new MatchableProduct();

    async map(order: Order): Promise<IMatchableOrder<string, string>> {
        this.logger.log(`Mapping order query`);

        return new MatchingEngineOrder(
            order.id,
            order.side,
            order.validFrom,
            this.testProduct,
            order.price,
            order.currentVolume,
            order.userId,
            order.createdAt,
            order.assetId
        );
    }
}
