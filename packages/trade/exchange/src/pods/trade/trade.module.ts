import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TradeExecutedEventHandler } from './trade-executed-event.handler';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';

@Module({
    providers: [TradeService, TradeExecutedEventHandler],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), CqrsModule]
})
export class TradeModule {}
