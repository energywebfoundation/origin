import { Module } from '@nestjs/common';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { OrderAccountingService } from './order-accounting.service';
import { OrderModule } from './order.module';

@Module({
    providers: [OrderAccountingService],
    imports: [OrderModule, AccountBalanceModule]
})
export class OrderAccountingModule {}
