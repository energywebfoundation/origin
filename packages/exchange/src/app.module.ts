import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { AccountModule } from './pods/account/account.module';
import { AssetModule } from './pods/asset/asset.module';
import { BundleAccountingModule, BundleModule } from './pods/bundle';
import { DemandModule } from './pods/demand/demand.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderAccountingModule, OrderModule } from './pods/order';
import { TradeModule } from './pods/trade/trade.module';
import { TransferAccountingModule, TransferModule } from './pods/transfer';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        MatchingEngineModule,
        TradeModule,
        TransferModule,
        TransferAccountingModule,
        DemandModule,
        AssetModule,
        AccountModule,
        AccountDeployerModule,
        AccountBalanceModule,
        BundleModule,
        BundleAccountingModule,
        OrderModule,
        OrderAccountingModule
    ],
    providers: [IntUnitsOfEnergy]
})
export class AppModule {}
