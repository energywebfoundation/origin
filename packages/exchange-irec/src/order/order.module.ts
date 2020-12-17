import {
    AccountBalanceModule,
    Order,
    OrderAccountingService,
    OrderService
} from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RunnerModule } from '../runner';
import { GetMappedOrderHandler } from './get-mapped-order.handler';
import { OrderController } from './order.controller';

@Module({
    providers: [OrderService, OrderAccountingService, GetMappedOrderHandler],
    exports: [OrderService, GetMappedOrderHandler],
    imports: [TypeOrmModule.forFeature([Order]), AccountBalanceModule, CqrsModule, RunnerModule],
    controllers: [OrderController]
})
export class OrderModule {}
