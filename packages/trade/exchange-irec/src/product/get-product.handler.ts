/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetProductQuery } from '@energyweb/exchange';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductDTO } from '.';
import { ProductService } from './product.service';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
    constructor(private readonly productService: ProductService) {}

    async execute({ assetId }: GetProductQuery): Promise<ProductDTO> {
        return this.productService.getProduct(assetId);
    }
}
