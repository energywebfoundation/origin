import { Module } from '@nestjs/common';
import {
    DepositApprovedEventHandler,
    DepositDiscoveredEventHandler,
    DepositWatcherModule
} from './deposit-watcher';
import { WithdrawalProcessorModule, WithdrawalRequestedEventHandler } from './withdrawal-processor';

@Module({
    providers: [
        WithdrawalRequestedEventHandler,
        DepositApprovedEventHandler,
        DepositDiscoveredEventHandler
    ],
    imports: [DepositWatcherModule, WithdrawalProcessorModule]
})
export class ExchangeErc1888Module {}
