import { Module } from '@nestjs/common';

import { AccountBalanceController } from './account-balance.controller';
import { AccountBalanceService } from './account-balance.service';
import { GetAssetAmountQueryHandler } from './handlers/get-asset-amount.handler';
import { HasEnoughAssetAmountQueryHandler } from './handlers/has-enough-asset-amount.handler';

@Module({
    providers: [
        AccountBalanceService,
        HasEnoughAssetAmountQueryHandler,
        GetAssetAmountQueryHandler
    ],
    exports: [AccountBalanceService],
    controllers: [AccountBalanceController]
})
export class AccountBalanceModule {}
