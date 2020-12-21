import { TradeModule as BaseTradeModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { TradeController } from './trade.controller';

@Module({
    imports: [BaseTradeModule],
    controllers: [TradeController]
})
export class TradeModule {}
