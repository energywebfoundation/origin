import { forwardRef, Module } from '@nestjs/common';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { AccountDeployerModule } from '../account-deployer/account-deployer.module';
import { TransferModule } from '../transfer/transfer.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
    imports: [
        forwardRef(() => AccountBalanceModule),
        AccountDeployerModule,
        forwardRef(() => TransferModule)
    ],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
