import { Module } from '@nestjs/common';
import { TransferModule, OrderModule, AccountModule } from '@energyweb/exchange';
import { DepositWatcherService } from './deposit-watcher.service';

@Module({
    providers: [DepositWatcherService],
    imports: [TransferModule, OrderModule, AccountModule],
    exports: [DepositWatcherService]
})
export class DepositWatcherModule {}
