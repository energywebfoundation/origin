import { AccountModule, OrderModule, TransferModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DepositWatcherService } from './deposit-watcher.service';

@Module({
    providers: [DepositWatcherService],
    imports: [TransferModule, OrderModule, AccountModule, ConfigModule],
    exports: [DepositWatcherService]
})
export class DepositWatcherModule {}
