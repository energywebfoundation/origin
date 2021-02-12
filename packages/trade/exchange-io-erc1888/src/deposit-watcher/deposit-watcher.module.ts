import { AccountModule, OrderModule, TransferModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { DepositWatcherService } from './deposit-watcher.service';

@Module({
    providers: [DepositWatcherService],
    imports: [TransferModule, OrderModule, AccountModule, ConfigModule, CqrsModule],
    exports: [DepositWatcherService]
})
export class DepositWatcherModule {}
