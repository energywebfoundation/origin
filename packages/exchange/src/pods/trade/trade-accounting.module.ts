import { Module } from '@nestjs/common';

import { TradeModule } from './trade.module';
import { AccountBalanceModule } from '../account-balance';
import { TradeAccountingService } from './trade-accounting.service';

@Module({
    providers: [TradeAccountingService],
    imports: [TradeModule, AccountBalanceModule]
})
export class TradeAccountingModule {}
