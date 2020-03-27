import { Module } from '@nestjs/common';

import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderModule } from '../order/order.module';
import { RunnerService } from './runner.service';

@Module({
    imports: [MatchingEngineModule, OrderModule],
    providers: [RunnerService],
    exports: [RunnerService]
})
export class RunnerModule {}
