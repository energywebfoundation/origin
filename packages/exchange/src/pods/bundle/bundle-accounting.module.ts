import { Module } from '@nestjs/common';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { BundleAccountingService } from './bundle-accounting.service';
import { BundleModule } from './bundle.module';

@Module({
    imports: [BundleModule, AccountBalanceModule],
    providers: [BundleAccountingService]
})
export class BundleAccountingModule {}
