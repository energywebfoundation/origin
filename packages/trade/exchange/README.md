<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Exchange

## Description

The Exchange package is a [NestJS](https://docs.nestjs.com/) application that provides backend services to manage the Exchange's functionality (account management and buying, selling and transferring Energy Attribute Certificates through an order book system).

It is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) Trade SDK.

## Documentation

-   [Exchange](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/trade/exchange/)
-   [Trade SDK](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/trade/)

## Contributing Guidelines

See [contributing.md](../../../contributing.md)

# Energy Web Decentralized Operating System

EW-Origin is a component of the Energy Web Decentralized Operating System (EW-DOS).

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

-   To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/)

For a deep-dive into the motivation and methodology behind our technical solutions, read our White Papers:

-   [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
-   [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

-   [Twitter](https://twitter.com/energywebx)
-   [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
-   [Telegram](https://t.me/energyweb)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Development

Exchange project is currently not meant to be run as a separate nest application. In order to run exchange project please refer to https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend-app

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

### Using TypeORM migrations

Exchange project uses TypeORM mechanism to perform SQL data migrations. For detailed information please refer to https://github.com/typeorm/typeorm/blob/master/docs/migrations.md

-   `yarn typeorm:run` to update DB to latest exchange tables schema
-   `yarn typeorm:migrate SampleMigrationName` to create new migration file based on the changes in the code entities

Development flow:

-   run `yarn typeorm:run` - to apply latest migrations
-   apply changes in the entities, like change the variable name or type
-   run `yarn typeorm:migrate LastestChanges...`
-   inspect newly created migration in /migrations folder
-   run `yarn typeorm:run` to apply newly created migration

**Warning:**

**Existing migration files from `/migration` folder should never be edited after being committed.**

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

#### SQL dump

`example/example.sql` contains a dump of database filled in with the example data:

1. User with `id=1` as a buyer (owner of the bid orders)
2. User with `id=2` as a seller (owner of the ask orders), with confirmed deposit of 100MWh (100000000)
3. 3 open bids with prices 90,85,75 for `{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}`
4. 3 open asks with prices 110,120,130 for `{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}`
5. 3 open bids with prices 79,78,77 for `{"deviceType":["Wind"],"location":["Thailand;Northeast"]`
6. 3 open asks with prices 80,85,86 for `{"deviceType":["Wind;Onshore"],"location":["Thailand;Northeast;Nakhon Ratchasima"],"deviceVintage":{"year":2014}}`
7. 1 filled ask
8. 1 partially filled bid
9. 1 trade

In order to deploy the data please use pgadmin or psql or similar tools to import \*.sql tool.

_Notice_ that you might need to remove previously imported data in case of PK violations. Use

```
TRUNCATE "account","asset","demand","order","trade","transfer" CASCADE
```

with caution.

This can be used for fast integrations and testing

### Swagger

Swagger endpoint can be found at

`http://localhost:3033/api`
