import { TradeModule as BaseTradeModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { AdminTradeController } from './admin-trade.controller';

@Module({
    imports: [BaseTradeModule],
    controllers: [AdminTradeController]
})
export class AdminTradeModule {}
