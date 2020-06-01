import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { OrderModule } from '../order/order.module';
import { RunnerModule } from '../runner/runner.module';
import { MatchingEngineService } from './matching-engine.service';

@Module({
    providers: [MatchingEngineService],
    exports: [MatchingEngineService],
    imports: [forwardRef(() => OrderModule), RunnerModule, CqrsModule]
})
export class MatchingEngineModule {}
