import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance';
import { RunnerModule } from '../runner/runner.module';
import { TradeAccountingService } from './trade-accounting.service';
import { TradeExecutedEventHandler } from './trade-executed-event.handler';
import { TradeController } from './trade.controller';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';

@Module({
    providers: [TradeService, TradeExecutedEventHandler, TradeAccountingService],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), RunnerModule, CqrsModule, AccountBalanceModule],
    controllers: [TradeController]
})
export class TradeModule {}
