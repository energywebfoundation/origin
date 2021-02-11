<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Origin-Backend-IREC-App</h2>
  <br>
</h1>

**Origin-Backend-IREC-App** package provides is a runner for a nest.js application that consist of **Origin-Backend** and **Exchange** packages.

## Development

Exchange project is currently not meant to be run as a separate nest application. In order to run exchange project please refer to https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend-irec-app

`yarn start` to start the origin backend and exchange as one application Note: this will not run the migrations for origin-backend and exchange.

Default TypeOrm configuration requires running PostgreSQL database. The detailed config with .env parameters is:

```
DB_HOST      - default 'localhost'
DB_PORT      - default 5432
DB_USERNAME  - default 'postgres',
DB_PASSWORD  - default 'postgres',
DB_DATABASE  - default 'origin',
```

or

```
DATABASE_URL  - postgres://{user}:{password}@{host}:{port}/{database}
```

Other configuration variables

```
PORT:                                           <PORT to which nest application start listening>
BACKEND_PORT:                                   <Same as PORT >
BACKEND_URL:                                    <URL on which this application will be available for e.g https://origin-api-canary.herokuapp.com>
BLOCKCHAIN_EXPLORER_URL:                        <For e.g for Volta network https://volta-rpc-origin-0a316ab339e3d2ee3.energyweb.org>
DEPLOY_KEY:                                     <Private key used for Issuer contracts deployment>
EMAIL_FROM:                                     <Email from for Mandrill API>
EMAIL_REPLY_TO:                                 <Email reply to for Mandrill API>
ENERGY_API_BASE_URL:                            <URL for Energy API>
EXCHANGE_ACCOUNT_DEPLOYER_PRIV:                 <Private key used for exchange accounts deployment>
EXCHANGE_WALLET_PRIV:                           <Private key for wallet used for withdrawals>
EXCHANGE_WALLET_PUB:                            <Address of the wallet defined in EXCHANGE_WALLET_PRIV>
ISSUER_ID:                                      <Name of the external device id type used in the issuance process for e.g Issuer ID>
JWT_EXPIRY_TIME:                                <Expiry time for e.g 7 days>
JWT_SECRET:                                     <Secret>
MANDRILL_API_KEY:                               <API KEY>
REGISTRATION_MESSAGE_TO_SIGN:                   <For e.g I register as Origin user>
UI_BASE_URL:                                    <URL on which UI is deployed for e.g https://origin-ui-canary.herokuapp.com/>
WEB3:                                           <WEB3 provider url>
MARKET_UTC_OFFSET:                              <UTC offset in minutes (-120, -60, 0, 60, etc)>
```

### PostgreSQL installation using Docker

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
```

#### pgAdmin

```
docker pull dpage/pgadmin4
docker run -p 80:80 \
    -e 'PGADMIN_DEFAULT_EMAIL=user@domain.com' \
    -e 'PGADMIN_DEFAULT_PASSWORD=SuperSecret' \
    -d dpage/pgadmin4
```

### Swagger

Swagger endpoint can be found at

`http://localhost:3033/api`

### Custom event handlers

It's possible to handle events emitted by `@energyweb/exchange` in the `@energyweb/origin-backend-app` project. This feature allows 3rd party developers to implement custom event handling logic, additional to existing core event handlers.

Currently supported event is `BulkTradeExecutedEvent` which is emitted whenever new trade in the matching engine occurs.

In order to register custom event handler for this event please follow these steps:

1. Create custom event handler code

```
import { BulkTradeExecutedEvent } from '@energyweb/exchange';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(BulkTradeExecutedEvent)
export class NewTradeExecutedEventHandler implements IEventHandler<BulkTradeExecutedEvent> {
    private readonly logger = new Logger(NewTradeExecutedEventHandler.name);

    async handle(event: BulkTradeExecutedEvent) {
        this.logger.debug(`Received trade executed events ${JSON.stringify(event)}`);
    }
}
```

Note: This follows the recipe created by Nest.js team which is documented here https://docs.nestjs.com/recipes/cqrs

2. Register your event handler as provider in `origin-app.module.ts`

```
@Module({})
export class OriginAppModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: OriginAppModule,
            imports: [
                OriginAppTypeOrmModule(),
                OriginBackendModule.register(smartMeterReadingsAdapter),
                ExchangeModule
            ],
            providers: [NewTradeExecutedEventHandler] // <-- add your event handler here
        };
    }
}
```

Note: Due to a way in which Nest.js is handling DI, your custom handler class name has to be unique, this means you should not use name taken by core event handler **TradeExecutedEventHandler**
