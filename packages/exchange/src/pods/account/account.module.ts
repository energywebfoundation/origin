import { Module } from '@nestjs/common';
import { TradeModule } from '../trade/trade.module';
import { DepositModule } from '../deposit/deposit.module';

@Module({
    imports: [TradeModule, DepositModule]
})
export class AccountModule {}
