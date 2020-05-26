import { Account } from './pods/account/account.entity';
import { Asset } from './pods/asset/asset.entity';
import { BundleItem } from './pods/bundle/bundle-item.entity';
import { BundleTrade } from './pods/bundle/bundle-trade.entity';
import { Bundle } from './pods/bundle/bundle.entity';
import { Demand } from './pods/demand/demand.entity';
import { Order } from './pods/order/order.entity';
import { Trade } from './pods/trade/trade.entity';
import { Transfer } from './pods/transfer/transfer.entity';

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
