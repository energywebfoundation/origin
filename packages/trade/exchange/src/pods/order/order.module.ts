import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order.entity';
import { OrderService } from './order.service';

@Module({
    providers: [OrderService],
    exports: [OrderService],
    imports: [TypeOrmModule.forFeature([Order]), CqrsModule]
})
export class OrderModule {}
