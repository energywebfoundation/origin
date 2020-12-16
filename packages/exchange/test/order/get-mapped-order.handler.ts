import { IMatchableOrder, Order } from '@energyweb/exchange-core';
import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetMappedOrderQuery } from '../../src/pods/matching-engine/queries/get-mapped-order.query';
import { MatchableProduct } from './matchable-product';

@QueryHandler(GetMappedOrderQuery)
export class GetMappedOrderHandler implements IQueryHandler<GetMappedOrderQuery> {
    private readonly logger = new Logger(GetMappedOrderHandler.name);

    private readonly testProduct = new MatchableProduct();

    async execute({ order }: GetMappedOrderQuery): Promise<IMatchableOrder<string, string>> {
        this.logger.log(`Mapping order query`);

        return new Order(
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
