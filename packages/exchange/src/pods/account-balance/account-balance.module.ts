import { Module, forwardRef } from '@nestjs/common';
import { AccountBalanceService } from './account-balance.service';
import { OrderModule } from '../order/order.module';
import { TradeModule } from '../trade/trade.module';
import { TransferModule } from '../transfer/transfer.module';
import { BundleModule } from '../bundle/bundle.module';
import { AccountBalanceController } from './account-balance.controller';

@Module({
    providers: [AccountBalanceService],
    exports: [AccountBalanceService],
    imports: [
        forwardRef(() => OrderModule),
        TradeModule,
        TransferModule,
        forwardRef(() => BundleModule)
    ],
    controllers: [AccountBalanceController]
})
export class AccountBalanceModule {}
