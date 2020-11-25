import {
    AccountClient,
    AssetClient,
    BundleClient,
    Configuration,
    DemandClient,
    OrderbookClient,
    OrdersClient,
    TradeClient,
    TransferClient
} from '@energyweb/exchange-client';
import { BaseClient } from '@energyweb/origin-ui-core';

export class ExchangeClient extends BaseClient {
    accountClient: AccountClient;

    assetClient: AssetClient;

    bundleClient: BundleClient;

    demandClient: DemandClient;

    orderbookClient: OrderbookClient;

    ordersClient: OrdersClient;

    tradeClient: TradeClient;

    transferClient: TransferClient;

    setup(accessToken?: string) {
        const config = new Configuration(
            accessToken
                ? {
                      baseOptions: {
                          headers: {
                              Authorization: `Bearer ${accessToken}`
                          }
                      },
                      accessToken
                  }
                : {}
        );

        this.accountClient = new AccountClient(config, this.backendUrl);
        this.assetClient = new AssetClient(config, this.backendUrl);
        this.bundleClient = new BundleClient(config, this.backendUrl);
        this.demandClient = new DemandClient(config, this.backendUrl);
        this.orderbookClient = new OrderbookClient(config, this.backendUrl);
        this.ordersClient = new OrdersClient(config, this.backendUrl);
        this.transferClient = new TransferClient(config, this.backendUrl);
    }
}
