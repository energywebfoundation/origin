import { Module } from '@nestjs/common';

import { AccountBalanceController } from './account-balance.controller';
import { AccountBalanceService } from './account-balance.service';

@Module({
    providers: [AccountBalanceService],
    exports: [AccountBalanceService],
    controllers: [AccountBalanceController]
})
export class AccountBalanceModule {}
