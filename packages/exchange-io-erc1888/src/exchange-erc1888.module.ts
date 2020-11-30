import { Module } from '@nestjs/common';
import { DepositWatcherModule } from './deposit-watcher';
import { WithdrawalProcessorModule, WithdrawalRequestedEventHandler } from './withdrawal-processor';

@Module({
    providers: [WithdrawalRequestedEventHandler],
    imports: [DepositWatcherModule, WithdrawalProcessorModule]
})
export class ExchangeErc1888Module {}
