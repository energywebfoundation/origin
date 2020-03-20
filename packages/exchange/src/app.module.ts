import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';

import { EmptyResultInterceptor } from './empty-result.interceptor';
import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { Account } from './pods/account/account.entity';
import { AccountModule } from './pods/account/account.module';
import { Asset } from './pods/asset/asset.entity';
import { AssetModule } from './pods/asset/asset.module';
import { Demand } from './pods/demand/demand.entity';
import { DemandModule } from './pods/demand/demand.module';
import { DepositWatcherModule } from './pods/deposit-watcher/deposit-watcher.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderBookModule } from './pods/order-book/order-book.module';
import { Order } from './pods/order/order.entity';
import { OrderModule } from './pods/order/order.module';
import { ProductModule } from './pods/product/product.module';
import { RunnerModule } from './pods/runner';
import { Trade } from './pods/trade/trade.entity';
import { TradeModule } from './pods/trade/trade.module';
import { Transfer } from './pods/transfer/transfer.entity';
import { TransferModule } from './pods/transfer/transfer.module';
import { WithdrawalProcessorModule } from './pods/withdrawal-processor/withdrawal-processor.module';

const getEnvFilePath = () => {
    if (__dirname.includes('dist/js')) {
        return path.resolve(__dirname, '../../../../../.env');
    }
    return null;
};

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: getEnvFilePath(),
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'ExchangeConnection',
            host: process.env.EXCHANGE_DB_HOST ?? 'localhost',
            port: Number(process.env.EXCHANGE_DB_PORT) ?? 5432,
            username: process.env.EXCHANGE_DB_USERNAME ?? 'postgres',
            password: process.env.EXCHANGE_DB_PASSWORD ?? 'postgres',
            database: process.env.EXCHANGE_DB_DATABASE ?? 'origin-exchange',
            entities: [Demand, Order, Trade, Asset, Transfer, Account],
            synchronize: true,
            logging: ['info']
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
        RunnerModule
    ],
    providers: [
        { provide: APP_PIPE, useClass: ValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: EmptyResultInterceptor }
    ]
})
export class AppModule {}
