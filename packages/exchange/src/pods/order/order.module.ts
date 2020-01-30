import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order.entity';
import { OrderService } from './order.service';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderController } from './order.controller';

@Module({
    providers: [OrderService],
    exports: [OrderService],
    imports: [TypeOrmModule.forFeature([Order], 'ExchangeConnection'), MatchingEngineModule],
    controllers: [OrderController]
})
export class OrderModule {}
