import { Module } from '@nestjs/common';
import { DepositWatcherService } from './deposit-watcher.service';
import { TransferModule } from '../transfer/transfer.module';
import { OrderModule } from '../order/order.module';
import { AccountModule } from '../account/account.module';

@Module({
    providers: [DepositWatcherService],
    imports: [TransferModule, OrderModule, AccountModule],
    exports: [DepositWatcherService]
})
export class DepositWatcherModule {}
