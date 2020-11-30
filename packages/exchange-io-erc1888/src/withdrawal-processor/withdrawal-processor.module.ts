import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransferModule, AccountBalanceModule } from '@energyweb/exchange';
import { WithdrawalProcessorService } from './withdrawal-processor.service';

@Module({
    imports: [forwardRef(() => TransferModule), forwardRef(() => AccountBalanceModule), CqrsModule],
    providers: [WithdrawalProcessorService],
    exports: [WithdrawalProcessorService]
})
export class WithdrawalProcessorModule {}
