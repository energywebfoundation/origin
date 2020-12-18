import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance';
import { TradeAccountingService } from './trade-accounting.service';
import { TradeExecutedEventHandler } from './trade-executed-event.handler';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';

@Module({
    providers: [TradeService, TradeExecutedEventHandler, TradeAccountingService],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), CqrsModule, AccountBalanceModule]
})
export class TradeModule {}
