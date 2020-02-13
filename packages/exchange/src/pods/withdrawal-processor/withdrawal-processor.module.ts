import { Module, forwardRef } from '@nestjs/common';
import { WithdrawalProcessorService } from './withdrawal-processor.service';
import { TransferModule } from '../transfer/transfer.module';
import { AccountBalanceModule } from '../account-balance/account-balance.module';

@Module({
    imports: [forwardRef(() => TransferModule), forwardRef(() => AccountBalanceModule)],
    providers: [WithdrawalProcessorService],
    exports: [WithdrawalProcessorService]
})
export class WithdrawalProcessorModule {}
