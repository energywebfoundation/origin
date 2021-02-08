import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountModule } from '../account/account.module';
import { OrderModule } from '../order/order.module';
import { SupplyModule } from '../supply/supply.module';
import { DepositApprovedEventHandler } from './handlers/deposit-approved-event.handler';
import { PostForSaleService } from './post-for-sale.service';

@Module({
    providers: [PostForSaleService, DepositApprovedEventHandler],
    exports: [PostForSaleService],
    imports: [OrderModule, AccountModule, CqrsModule, ConfigModule, SupplyModule]
})
export class PostForSaleModule {}
