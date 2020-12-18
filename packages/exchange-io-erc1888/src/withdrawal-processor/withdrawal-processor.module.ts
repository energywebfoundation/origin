import { AccountBalanceModule, TransferModule } from '@energyweb/exchange';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { WithdrawalProcessorService } from './withdrawal-processor.service';

@Module({
    imports: [
        forwardRef(() => TransferModule),
        forwardRef(() => AccountBalanceModule),
        CqrsModule,
        ConfigModule
    ],
    providers: [WithdrawalProcessorService],
    exports: [WithdrawalProcessorService]
})
export class WithdrawalProcessorModule {}
