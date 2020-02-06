import { Module, forwardRef } from '@nestjs/common';
import { TradeModule } from '../trade/trade.module';
import { TransferModule } from '../transfer/transfer.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [TradeModule, forwardRef(() => TransferModule), forwardRef(() => OrderModule)],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
