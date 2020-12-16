import { Module } from '@nestjs/common';

import { OrderController } from './order.controller';
import { OrderModule as BaseOrderModule } from '../../src/pods/order';
import { GetMappedOrderHandler } from './get-mapped-order.handler';

@Module({
    providers: [GetMappedOrderHandler],
    controllers: [OrderController],
    imports: [BaseOrderModule]
})
export class OrderModule {}
