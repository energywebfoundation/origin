import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import fs from 'fs';
import path from 'path';

import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { AccountModule } from './pods/account/account.module';
import { AssetModule } from './pods/asset/asset.module';
import { DemandModule } from './pods/demand/demand.module';
import { DepositWatcherModule } from './pods/deposit-watcher/deposit-watcher.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderBookModule } from './pods/order-book/order-book.module';
import { OrderModule } from './pods/order/order.module';
import { ProductModule } from './pods/product/product.module';
import { RunnerModule } from './pods/runner/runner.module';
import { TradeModule } from './pods/trade/trade.module';
import { TransferModule } from './pods/transfer/transfer.module';
import { WithdrawalProcessorModule } from './pods/withdrawal-processor/withdrawal-processor.module';
import { BundleModule } from './pods/bundle/bundle.module';
import { EmptyResultInterceptor } from './empty-result.interceptor';
import { HTTPLoggingInterceptor } from './utils/httpLoggingInterceptor';

const getEnvFilePath = () => {
    const pathsToTest = ['../../../../../.env', '../../../../../../.env'];

    let finalPath = null;

    for (const pathToTest of pathsToTest) {
        const resolvedPath = path.resolve(__dirname, pathToTest);

        if (__dirname.includes('dist/js') && fs.existsSync(resolvedPath)) {
            finalPath = resolvedPath;
            break;
        }
    }

    return finalPath;
};

export const providers = [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: EmptyResultInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HTTPLoggingInterceptor },
    IntUnitsOfEnergy
];

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: getEnvFilePath(),
            isGlobal: true
        }),
        ScheduleModule.forRoot(),
        MatchingEngineModule,
        TradeModule,
        OrderModule,
        DemandModule,
        OrderBookModule,
        AssetModule,
        TransferModule,
        AccountModule,
        ProductModule,
        AccountDeployerModule,
        AccountBalanceModule,
        DepositWatcherModule,
        WithdrawalProcessorModule,
        RunnerModule,
        BundleModule
    ],
    providers
})
export class AppModule {}
