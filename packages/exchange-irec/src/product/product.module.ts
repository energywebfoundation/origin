import { AssetModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GetProductHandler } from './get-product.handler';

import { ProductService } from './product.service';

@Module({
    imports: [AssetModule, ConfigModule],
    providers: [ProductService, GetProductHandler],
    exports: [ProductService]
})
export class ProductModule {}
