import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order.entity';
import { OrderService } from './order.service';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderController } from './order.controller';
import { ProductModule } from '../product/product.module';
import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { OrderAccountingService } from './order-accounting.service';

@Module({
    providers: [OrderService, OrderAccountingService],
    exports: [OrderService],
    imports: [
        TypeOrmModule.forFeature([Order]),
        forwardRef(() => MatchingEngineModule),
        AccountBalanceModule,
        ProductModule
    ],
    controllers: [OrderController]
})
export class OrderModule {}
