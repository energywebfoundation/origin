<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Origin-Backend</h2>
  <br>
</h1>

**Origin-Backend** package provides the API for managing users, certificate, requests and devices in the Origin project.

## Development

Origin-backend project is currently not meant to be run as a separate nest application. In order to run origin-backend project please refer to https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend-app

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
