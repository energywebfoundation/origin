import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountModule } from '../account/account.module';
import { OrderModule } from '../order';
import { DepositApprovedEventHandler } from './handlers';

import { PostForSaleService } from './post-for-sale.service';

@Module({
    providers: [PostForSaleService, DepositApprovedEventHandler],
    exports: [PostForSaleService],
    imports: [OrderModule, AccountModule, CqrsModule, ConfigModule]
})
export class PostForSaleModule {}
