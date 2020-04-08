import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { AssetModule } from '../asset/asset.module';

@Module({
    imports: [AssetModule],
    providers: [ProductService],
    exports: [ProductService]
})
export class ProductModule {}
