import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { AccountDeployerModule } from '../account-deployer/account-deployer.module';
import { Account } from './account.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
    imports: [
        forwardRef(() => TypeOrmModule.forFeature([Account])),
        forwardRef(() => AccountBalanceModule),
        AccountDeployerModule
    ],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
