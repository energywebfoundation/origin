<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <br>
</h1>

# @energyweb/migrations

This repository is used to deploy all the contracts and migrate configuration and seed data for the Origin project of the Energy Web Foundation.

## Running

Command line options:

```
  -c, --config <config_file_path>  path to the config file
  -s, --seed-file <seed_sql_path>  path to the SQL file that will be used for seeding the database
  -e, --env <env_file_path>        path to the .env file or system variables when not set
```

In a development mode use:

```
yarn start <options>
```

### Required configuration variables

-   `WEB3` - web3 endpoint url
-   `DEPLOY_KEY` - private key to be used for smart contracts deployment
-   `DATABASE_URL` - formatted as `postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]` - has precedence over DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
-   `DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE` - database connection details

#### Default configuration

Note: When no `DATABASE_URL` and `DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE` provided, the migration program will default to:

```
DB_HOST = 'localhost'
DB_PORT = 5432
DB_USERNAME = 'postgres'
DB_PASSWORD = 'postgres'
DB_DATABASE = 'origin'
```

Migrations program will read the `.env` file and `process.env` by default, this location of `.env` file can be specified using `-e` switch

## Migrations

Migrations project requires the database schema and tables to be migrated before.

Migrations will check the existence of the configuration tables in the provided database connection parameters. Process will perform:

-   deploy issuer and registry contracts from `@energyweb/issuer` package
-   stores initial configuration from provided `-c` JSON file path
-   stores the demo/seed data from provided -s sql file
