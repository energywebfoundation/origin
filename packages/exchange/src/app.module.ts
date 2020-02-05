import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { Demand } from './pods/demand/demand.entity';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { Order } from './pods/order/order.entity';
import { OrderModule } from './pods/order/order.module';
import { Trade } from './pods/trade/trade.entity';
import { TradeModule } from './pods/trade/trade.module';
import { DemandModule } from './pods/demand/demand.module';
import { OrderBookModule } from './pods/order-book/order-book.module';
import { AssetModule } from './pods/asset/asset.module';
import { DepositModule } from './pods/deposit/deposit.module';
import { Asset } from './pods/asset/asset.entity';
import { AccountModule } from './pods/account/account.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'origin-exchange',
            entities: [Demand, Order, Trade, Asset],
            synchronize: true,
            logging: ['query']
        }),
        ScheduleModule.forRoot(),
        MatchingEngineModule,
        TradeModule,
        OrderModule,
        DemandModule,
        OrderBookModule,
        AssetModule,
        DepositModule,
        AccountModule
    ],
    providers: [AppService]
})
export class AppModule {}
