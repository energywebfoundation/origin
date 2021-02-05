import { MatchingEngineModule, TradeModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { DeviceTypeValidator } from '../utils/deviceTypeValidator';
import { GridOperatorValidator } from '../utils/gridOperatorValidator';
import { RunnerModule } from '../runner/runner.module';
import { OrderBookController } from './order-book.controller';
import { OrderBookService } from './order-book.service';

@Module({
    providers: [OrderBookService, DeviceTypeValidator, GridOperatorValidator],
    imports: [MatchingEngineModule, RunnerModule, TradeModule],
    controllers: [OrderBookController]
})
export class OrderBookModule {}
