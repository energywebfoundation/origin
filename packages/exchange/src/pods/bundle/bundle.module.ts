import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BundleItem } from './bundle-item.entity';
import { BundleTrade } from './bundle-trade.entity';
import { Bundle } from './bundle.entity';
import { BundleService } from './bundle.service';
import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { BundleController } from './bundle.controller';
import { BundleAccountingService } from './bundle-accounting.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Bundle, BundleTrade, BundleItem]),
        forwardRef(() => AccountBalanceModule)
    ],
    providers: [BundleService, BundleAccountingService],
    exports: [BundleService],
    controllers: [BundleController]
})
export class BundleModule {}
