import { Module } from '@nestjs/common';
import { DepositWatcherService } from './deposit-watcher.service';
import { TransferModule } from '../transfer/transfer.module';

@Module({
    providers: [DepositWatcherService],
    imports: [TransferModule],
    exports: [DepositWatcherService]
})
export class DepositWatcherModule {}
