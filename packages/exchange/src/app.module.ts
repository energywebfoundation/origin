import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';

import { AppService } from './app.service';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { Account } from './pods/account/account.entity';
import { AccountModule } from './pods/account/account.module';
import { Asset } from './pods/asset/asset.entity';
import { AssetModule } from './pods/asset/asset.module';
import { Demand } from './pods/demand/demand.entity';
import { DemandModule } from './pods/demand/demand.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderBookModule } from './pods/order-book/order-book.module';
import { Order } from './pods/order/order.entity';
import { OrderModule } from './pods/order/order.module';
import { ProductModule } from './pods/product/product.module';
import { Trade } from './pods/trade/trade.entity';
import { TradeModule } from './pods/trade/trade.module';
import { Transfer } from './pods/transfer/transfer.entity';
import { TransferModule } from './pods/transfer/transfer.module';
import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { DepositWatcherModule } from './pods/deposit-watcher/deposit-watcher.module';
import { WithdrawalProcessorModule } from './pods/withdrawal-processor/withdrawal-processor.module';

const getEnvFilePath = () => {
    if (__dirname.includes('dist/js')) {
        return path.resolve(__dirname, '../../../../../.env');
    }
    return null;
};

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: getEnvFilePath(), isGlobal: true }),
        TypeOrmModule.forRoot({
            name: 'ExchangeConnection',
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'origin-exchange',
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
        WithdrawalProcessorModule
    ],
    // exports: [
    //     TypeOrmModule,
    //     ScheduleModule,
    //     MatchingEngineModule,
    //     TradeModule,
    //     OrderModule,
    //     DemandModule,
    //     OrderBookModule
    // ],
    providers: [AppService]
})
export class AppModule {}
