import { Module } from '@nestjs/common';
import { GetProductHandler } from './get-product.handler';

@Module({
    providers: [GetProductHandler]
})
export class ProductModule {}
