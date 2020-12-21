import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { AccountModule } from './pods/account/account.module';
import { AssetModule } from './pods/asset/asset.module';
import { BundleModule } from './pods/bundle/bundle.module';
import { DemandModule } from './pods/demand/demand.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderModule } from './pods/order';
import { TradeModule } from './pods/trade/trade.module';
import { TransferModule } from './pods/transfer/transfer.module';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        MatchingEngineModule,
        TradeModule,
        TransferModule,
        DemandModule,
        AssetModule,
        AccountModule,
        AccountDeployerModule,
        AccountBalanceModule,
        BundleModule,
        OrderModule
    ],
    providers: [IntUnitsOfEnergy]
})
export class AppModule {}
