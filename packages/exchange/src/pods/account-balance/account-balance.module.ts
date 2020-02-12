import { Module, forwardRef } from '@nestjs/common';
import { AccountBalanceService } from './account-balance.service';
import { OrderModule } from '../order/order.module';
import { TradeModule } from '../trade/trade.module';
import { TransferModule } from '../transfer/transfer.module';

@Module({
    providers: [AccountBalanceService],
    exports: [AccountBalanceService],
    imports: [forwardRef(() => OrderModule), TradeModule, TransferModule]
})
export class AccountBalanceModule {}
