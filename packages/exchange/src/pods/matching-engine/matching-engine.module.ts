import { Module } from '@nestjs/common';

import { TradeModule } from '../trade/trade.module';
import { MatchingEngineService } from './matching-engine.service';

@Module({
    providers: [MatchingEngineService],
    exports: [MatchingEngineService],
    imports: [TradeModule]
})
export class MatchingEngineModule {}
