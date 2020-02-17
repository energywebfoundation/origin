import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { AccountDeployerModule } from '../account-deployer/account-deployer.module';
import { Account } from './account';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account], 'ExchangeConnection'),
        forwardRef(() => AccountBalanceModule),
        AccountDeployerModule
    ],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
