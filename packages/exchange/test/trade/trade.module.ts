import { Module } from '@nestjs/common';

import { TradeModule as BaseTradeModule } from '../../src/pods/trade';
import { TradeController } from './trade.controller';

@Module({
    imports: [BaseTradeModule],
    controllers: [TradeController]
})
export class TradeModule {}
