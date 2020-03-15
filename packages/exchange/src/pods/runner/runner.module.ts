import { Module } from '@nestjs/common';

import { DeviceTypesModule } from '@energyweb/origin-backend';
import { RunnerService } from './runner.service';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderModule } from '../order/order.module';
import { DepositWatcherModule } from '../deposit-watcher/deposit-watcher.module';
import { WithdrawalProcessorModule } from '../withdrawal-processor/withdrawal-processor.module';

@Module({
    imports: [
        DeviceTypesModule,
        MatchingEngineModule,
        OrderModule,
        DepositWatcherModule,
        WithdrawalProcessorModule
    ],
    providers: [RunnerService],
    exports: [RunnerService]
})
export class RunnerModule {}
