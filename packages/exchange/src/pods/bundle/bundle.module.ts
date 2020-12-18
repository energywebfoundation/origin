import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { BundleAccountingService } from './bundle-accounting.service';
import { BundleItem } from './bundle-item.entity';
import { BundleTrade } from './bundle-trade.entity';
import { BundleController } from './bundle.controller';
import { Bundle } from './bundle.entity';
import { BundleService } from './bundle.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Bundle, BundleTrade, BundleItem]),
        forwardRef(() => AccountBalanceModule)
    ],
    providers: [BundleService, BundleAccountingService],
    exports: [BundleService],
    controllers: [BundleController]
})
export class BundleModule {}
