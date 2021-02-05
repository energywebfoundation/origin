/* eslint-disable @typescript-eslint/no-unused-vars */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProductQuery } from '../../src/pods/order/queries/get-product.query';

export const TestProduct = 'example product';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
    async execute(query: GetProductQuery): Promise<string> {
        return TestProduct;
    }
}
