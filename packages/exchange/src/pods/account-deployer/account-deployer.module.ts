import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AccountDeployerService } from './account-deployer.service';

@Module({
    imports: [ConfigModule],
    providers: [AccountDeployerService],
    exports: [AccountDeployerService]
})
export class AccountDeployerModule {}
