import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order.entity';
import { OrderService } from './order.service';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderController } from './order.controller';
import { AccountModule } from '../account/account.module';
import { ProductModule } from '../product/product.module';
import { AssetModule } from '../asset/asset.module';

@Module({
    providers: [OrderService],
    exports: [OrderService],
    imports: [
        TypeOrmModule.forFeature([Order]),
        MatchingEngineModule,
        forwardRef(() => AccountModule),
        ProductModule,
        AssetModule
    ],
    controllers: [OrderController]
})
export class OrderModule {}
