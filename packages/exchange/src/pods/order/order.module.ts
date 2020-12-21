import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderAccountingService } from './order-accounting.service';
import { OrderService } from './order.service';
import { AccountBalanceModule } from '../account-balance';
import { Order } from './order.entity';

@Module({
    providers: [OrderService, OrderAccountingService],
    exports: [OrderService],
    imports: [TypeOrmModule.forFeature([Order]), AccountBalanceModule, CqrsModule]
})
export class OrderModule {}
