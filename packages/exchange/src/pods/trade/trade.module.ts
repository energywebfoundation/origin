import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RunnerModule } from '../runner/runner.module';
import { TradeExecutedEventHandler } from './trade-executed-event.handler';
import { TradeController } from './trade.controller';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';

@Module({
    providers: [TradeService, TradeExecutedEventHandler],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), RunnerModule, CqrsModule],
    controllers: [TradeController]
})
export class TradeModule {}
