import { Module } from '@nestjs/common';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { TransferAccountingService } from './transfer-accounting.service';
import { TransferModule } from './transfer.module';

@Module({
    providers: [TransferAccountingService],
    imports: [TransferModule, AccountBalanceModule]
})
export class TransferAccountingModule {}
