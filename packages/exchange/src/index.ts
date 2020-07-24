import { Account } from './pods/account/account.entity';
import { Asset } from './pods/asset/asset.entity';
import { BundleItem } from './pods/bundle/bundle-item.entity';
import { BundleTrade } from './pods/bundle/bundle-trade.entity';
import { Bundle } from './pods/bundle/bundle.entity';
import { Demand } from './pods/demand/demand.entity';
import { Order } from './pods/order/order.entity';
import { Trade } from './pods/trade/trade.entity';
import { Transfer } from './pods/transfer/transfer.entity';

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

export { BulkTradeExecutedEvent } from './pods/matching-engine/bulk-trade-executed.event';
export { TradePersistedEvent } from './pods/trade/trade-persisted.event';

export { AppModule } from './app.module';

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
