import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountModule } from '../account/account.module';
import { OrderModule } from '../order';
import { DepositApprovedEventHandler, DepositDiscoveredEventHandler } from './handlers';

import { PostForSaleService } from './post-for-sale.service';

@Module({
    providers: [PostForSaleService, DepositApprovedEventHandler, DepositDiscoveredEventHandler],
    exports: [PostForSaleService],
    imports: [OrderModule, AccountModule, CqrsModule, ConfigModule]
})
export class PostForSaleModule {}
