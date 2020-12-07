import { AccountBalanceModule } from './pods/account-balance/account-balance.module';
import { AccountDeployerModule } from './pods/account-deployer/account-deployer.module';
import { Account } from './pods/account/account.entity';
import { AccountModule } from './pods/account/account.module';
import { Asset } from './pods/asset/asset.entity';
import { AssetModule } from './pods/asset/asset.module';
import { BundleItem } from './pods/bundle/bundle-item.entity';
import { BundleTrade } from './pods/bundle/bundle-trade.entity';
import { Bundle } from './pods/bundle/bundle.entity';
import { BundleModule } from './pods/bundle/bundle.module';
import { Demand } from './pods/demand/demand.entity';
import { DemandModule } from './pods/demand/demand.module';
import { DepositWatcherModule } from './pods/deposit-watcher/deposit-watcher.module';
import { MatchingEngineModule } from './pods/matching-engine/matching-engine.module';
import { OrderBookModule } from './pods/order-book/order-book.module';
import { Order } from './pods/order/order.entity';
import { OrderModule } from './pods/order/order.module';
import { ProductModule } from './pods/product/product.module';
import { RunnerModule } from './pods/runner/runner.module';
import { Trade } from './pods/trade/trade.entity';
import { TradeModule } from './pods/trade/trade.module';
import { Transfer } from './pods/transfer/transfer.entity';
import { TransferModule } from './pods/transfer/transfer.module';
import { WithdrawalProcessorModule } from './pods/withdrawal-processor/withdrawal-processor.module';

export * from './app.module';
export * from './interfaces';
export * from './pods';
export * from './utils';

export const entities = [
    Demand,
    Trade,
    Order,
    Transfer,
    Account,
    Asset,
    Bundle,
    BundleItem,
    BundleTrade
];

export const modules = [
    AccountBalanceModule,
    AccountDeployerModule,
    AccountModule,
    AssetModule,
    DemandModule,
    DepositWatcherModule,
    MatchingEngineModule,
    OrderBookModule,
    OrderModule,
    ProductModule,
    RunnerModule,
    TradeModule,
    TransferModule,
    WithdrawalProcessorModule,
    BundleModule
];
