import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderModule } from '../order';
import { CancelOrderHandler, SubmitOrderHandler } from './handlers';

import { MatchingEngineService } from './matching-engine.service';

@Module({
    providers: [MatchingEngineService, SubmitOrderHandler, CancelOrderHandler],
    exports: [MatchingEngineService],
    imports: [OrderModule, CqrsModule, ConfigModule]
})
export class MatchingEngineModule {}
