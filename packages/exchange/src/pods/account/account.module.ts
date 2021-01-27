import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountDeployerModule } from '../account-deployer/account-deployer.module';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
    imports: [TypeOrmModule.forFeature([Account]), AccountDeployerModule],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
