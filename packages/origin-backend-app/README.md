<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Origin-Backend-App</h2>
  <br>
</h1>

**Origin-Backend-App** package provides is a runner for a nest.js application that consist of **Origin-Backend** and **Exchange** packages.

## Development

Exchange project is currently not meant to be run as a separate nest application. In order to run exchange project please refer to https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend-app

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
