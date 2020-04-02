import { Module, forwardRef } from '@nestjs/common';

import { TradeModule } from '../trade/trade.module';
import { MatchingEngineService } from './matching-engine.service';
import { OrderModule } from '../order/order.module';

@Module({
    providers: [MatchingEngineService],
    exports: [MatchingEngineService],
    imports: [TradeModule, forwardRef(() => OrderModule)]
})
export class MatchingEngineModule {}
