import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderModule } from '../order';
import { CancelOrderHandler, SubmitOrderHandler } from './handlers';
import { GetMappedOrderHandler } from './handlers/get-mapped-order.handler';

import { MatchingEngineService } from './matching-engine.service';

@Module({
    providers: [
        MatchingEngineService,
        SubmitOrderHandler,
        CancelOrderHandler,
        GetMappedOrderHandler
    ],
    exports: [MatchingEngineService, GetMappedOrderHandler],
    imports: [OrderModule, CqrsModule, ConfigModule]
})
export class MatchingEngineModule {}
