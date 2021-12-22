<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <br>
</h1>

**Origin** is a set of toolkits that together provide a system for issuance and management of Energy Attribute Certificates (EACs). This repository is an entry point to Origin systems. It has a goal of explaining briefly the whole system and providing you with insight and info where to explore next.

<p align="center">
  <img src="https://github.com/energywebfoundation/origin/actions/workflows/deploy-master.yml/badge.svg" />
</p>

:construction: Documentation available at [https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) :construction:

## Table of Contents

-   [Table of Contents](#table-of-contents)
-   [Packages](#packages)
    -   [SDK Releases](#sdk-releases)
    -   [Applications, Infrastructure and Demo](#applications-infrastructure-and-demo)
    -   [Packages types](#packages-types)
        -   [Stable](#stable)
        -   [Canary](#canary)
        -   [Preview](#preview)
-   [Preparation](#preparation)
-   [Installation](#installation)
-   [Build](#build)
-   [Test](#test)
-   [Run demo](#run-demo)
    -   [Heroku environment provisioning](#heroku-environment-provisioning)
-   [Energy Attribute Certificates](#energy-attribute-certificates)
-   [Deployment](#deployment)
-   [Contribution guidelines](#contribution-guidelines)

## Packages

### SDK Releases

| Package                                                                                                       | Stable                                                                                                                                                                      | Canary                                                                                                                                                                         | Description                                                                             |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [`@energyweb/origin-device-registry-api`](/packages/devices/origin-device-registry-api)                       | [![npm](https://img.shields.io/npm/v/@energyweb/origin-device-registry-api.svg)](https://www.npmjs.com/package/@energyweb/origin-device-registry-api)                       | [![npm](https://img.shields.io/npm/v/@energyweb/origin-device-registry-api/canary)](https://www.npmjs.com/package/@energyweb/origin-device-registry-api)                       | Generic implementation of API working with Origin device registry                       |
| [`@energyweb/origin-device-registry-irec-local-api`](/packages/devices/origin-device-registry-irec-local-api) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-device-registry-irec-local-api.svg)](https://www.npmjs.com/package/@energyweb/origin-device-registry-irec-local-api) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-device-registry-irec-local-api/canary)](https://www.npmjs.com/package/@energyweb/origin-device-registry-irec-local-api) | API for local version of I-REC compatible registry                                      |
| [`@energyweb/origin-energy-api`](/packages/devices/origin-energy-api)                                         | [![npm](https://img.shields.io/npm/v/@energyweb/origin-energy-api.svg)](https://www.npmjs.com/package/@energyweb/origin-energy-api)                                         | [![npm](https://img.shields.io/npm/v/@energyweb/origin-energy-api/canary)](https://www.npmjs.com/package/@energyweb/origin-energy-api)                                         | API for Smart meter reads                                                               |
| [`@energyweb/origin-organization-irec-api`](/packages/devices/origin-organization-irec-api)                   | [![npm](https://img.shields.io/npm/v/@energyweb/origin-organization-irec-api.svg)](https://www.npmjs.com/package/@energyweb/origin-organization-irec-api)                   | [![npm](https://img.shields.io/npm/v/@energyweb/origin-organization-irec-api/canary)](https://www.npmjs.com/package/@energyweb/origin-organization-irec-api)                   | API for I-REC based organizations                                                       |
| [`@energyweb/origin-backend`](/packages/origin-backend)                                                       | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend.svg)](https://www.npmjs.com/package/@energyweb/origin-backend)                                               | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend/canary)](https://www.npmjs.com/package/@energyweb/origin-backend)                                               | Example backend necessary for running Origin                                            |
| [`@energyweb/issuer`](/packages/traceability/issuer)                                                          | [![npm](https://img.shields.io/npm/v/@energyweb/issuer.svg)](https://www.npmjs.com/package/@energyweb/issuer)                                                               | [![npm](https://img.shields.io/npm/v/@energyweb/issuer/canary)](https://www.npmjs.com/package/@energyweb/issuer)                                                               | Energy Attribute Certificates Issuer Module                                             |
| [`@energyweb/issuer-api`](/packages/traceability/issuer-api)                                                  | [![npm](https://img.shields.io/npm/v/@energyweb/issuer-api.svg)](https://www.npmjs.com/package/@energyweb/issuer-api)                                                       | [![npm](https://img.shields.io/npm/v/@energyweb/issuer-api/canary)](https://www.npmjs.com/package/@energyweb/issuer-api)                                                       | NestJS module for interacting with renewable energy certificates                        |
| [`@energyweb/issuer-irec-api`](/packages/traceability/issuer-irec-api)                                        | [![npm](https://img.shields.io/npm/v/@energyweb/issuer-irec-api.svg)](https://www.npmjs.com/package/@energyweb/issuer-irec-api)                                             | [![npm](https://img.shields.io/npm/v/@energyweb/issuer-irec-api/canary)](https://www.npmjs.com/package/@energyweb/issuer-irec-api)                                             | NestJS module for interacting with renewable energy certificates with IREC connectivity |
| [`@energyweb/exchange`](/packages/trade/exchange)                                                             | [![npm](https://img.shields.io/npm/v/@energyweb/exchange.svg)](https://www.npmjs.com/package/@energyweb/exchange)                                                           | [![npm](https://img.shields.io/npm/v/@energyweb/exchange/canary)](https://www.npmjs.com/package/@energyweb/exchange)                                                           | A service project hosting order book based exchange                                     |
| [`@energyweb/exchange-irec`](/packages/trade/exchange-irec)                                                   | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-irec.svg)](https://www.npmjs.com/package/@energyweb/exchange-irec)                                                 | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-irec/canary)](https://www.npmjs.com/package/@energyweb/exchange-irec)                                                 | A service project hosting order book based I-REC specific exchange                      |
| [`@energyweb/exchange-core`](/packages/trade/exchange-core)                                                   | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-core.svg)](https://www.npmjs.com/package/@energyweb/exchange-core)                                                 | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-core/canary)](https://www.npmjs.com/package/@energyweb/exchange-core)                                                 | Generic EACs order book product and matching                                            |
| [`@energyweb/exchange-core-irec`](/packages/trade/exchange-core-irec)                                         | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-core-irec.svg)](https://www.npmjs.com/package/@energyweb/exchange-core-irec)                                       | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-core-irec/canary)](https://www.npmjs.com/package/@energyweb/exchange-core-irec)                                       | An IREC based EACs product and matching                                                 |
| [`@energyweb/exchange-io-erc1888`](/packages/trade/exchange-io-erc1888)                                       | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-io-erc1888.svg)](https://www.npmjs.com/package/@energyweb/exchange-io-erc1888)                                     | [![npm](https://img.shields.io/npm/v/@energyweb/exchange-io-erc1888/canary)](https://www.npmjs.com/package/@energyweb/exchange-core-irec)                                      | ERC1888 withdwaral/deposit processing for exchange                                      |
| [`@energyweb/utils-general`](/packages/utils-general)                                                         | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general.svg)](https://www.npmjs.com/package/@energyweb/utils-general)                                                 | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general/canary)](https://www.npmjs.com/package/@energyweb/utils-general)                                                 | General Utilities                                                                       |
| [`@energyweb/origin-ui-core`](/packages/ui/libs/ui/core)                                                      | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-core.svg)](https://www.npmjs.com/package/@energyweb/origin-ui-core)                                               | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-core/canary)](https://www.npmjs.com/package/@energyweb/origin-ui-core)                                               | React components library for building Origin marketplace user interface                 |
| [`@energyweb/origin-ui-localization`](/packages/ui/libs/ui/localization)                                      | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-localization.svg)](https://www.npmjs.com/package/@energyweb/origin-ui-localization)                               | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-localization/canary)](https://www.npmjs.com/package/@energyweb/origin-ui-localization)                               | Localization library for building Origin marketplace user interface                     |
| [`@energyweb/origin-ui-theme`](/packages/ui/libs/ui/theme)                                                    | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-theme.svg)](https://www.npmjs.com/package/@energyweb/origin-ui-theme)                                             | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-theme/canary)](https://www.npmjs.com/package/@energyweb/origin-ui-theme)                                             | Material-UI theme configuration and styling utilities                                   |
| [`@energyweb/origin-ui-utils`](/packages/ui/libs/ui/utils)                                                    | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-utils.svg)](https://www.npmjs.com/package/@energyweb/origin-ui-utils)                                             | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui-utils/canary)](https://www.npmjs.com/package/@energyweb/origin-ui-utils)                                             | UI general utilities                                                                    |

### Applications, Infrastructure and Demo

| Package                                                                        | Description                                                     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [`@energyweb/origin-backend-irec-app`](/packages/apps/origin-backend-irec-app) | Bootstrap project for Origin API that uses I-REC API connection |
| [`@energyweb/origin-ui`](/packages/ui/apps/origin-ui)                          | Root of UI for Origin                                           |
| [`@energyweb/migrations-irec`](/packages/tools/migrations-irec)                | Deployment and configuration utilities                          |

### Packages types

Origin monorepo produce 3 types of the packages that are meant to be used in different use-cases:

#### Stable

Stable Origin SDK packages are created during `release` branch build.

Install using `yarn add @energyweb/{package}`

#### Canary

Canary packages are created during `master` branch builds. Canary reflects current state of the `master` branch, they should be a working versions considers as `alpha`

Install using `yarn add @energyweb/{package}@canary`

#### Preview

Preview packages are built on a special `preview` branch, this is mostly used as interal tool for tests, demos, discussions.

Install using `yarn add @energyweb/{package}@preview`

## Preparation

1. Make sure you are using Node 14.x.x
2. Make sure have latest `@microsoft/rush` package manager installed.

```shell
npm install -g @microsoft/rush
```

3. Make sure you have Java runtime installed
4. Install [Postgres](https://www.postgresql.org/download/) 12.x+ and create a new database named `origin`.

We recommend using Docker based setup as follows (requires psql command line tool installed):

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=origin -d -p 5432:5432 postgres
```

4. Make sure you have created a `.env` file in the root of the monorepo and that all necessary variables are set.
   Use [`.env.example`](.env.example) as an example of how the `.env` file should look.

5. Create InfluxDB to store smart meter readings

```
docker run --rm --env-file ./.env -v $PWD/influxdb-local:/var/lib/influxdb influxdb:1.8 /init-influxdb.sh
```

Run the InfluxDB instance

```
docker run --name energy-influxdb --env-file ./.env -d -p 8086:8086 -v $PWD/influxdb-local:/var/lib/influxdb -v $PWD/influxdb.conf:/etc/influxdb/influxdb.conf:ro influxdb:1.8
```

1. For custom DB credentials, ports, db name etc refer to https://github.com/energywebfoundation/origin/tree/master/packages/apps/origin-backend-irec-app#development

## Installation

```shell
rush update
```

## Build

```shell
rush build
```

## Test

```shell
rush test:e2e
```

## Run demo

After you have the `.env` file created, installed dependencies (`rush install`) and build completed (`rush build`) run the following command:

```shell
rush run:origin
```

Visit the UI at: http://localhost:3000.

### Heroku environment provisioning

For fast deployment to Heroku you can run the available script `provision-heroku-origin`

```
PREFIX=<name> STAGE=<stage> TEAM=<team> ./provision-heroku-origin.sh
```

Naming convention is for apps:

```
${PREFIX}-origin-ui-${STAGE}
${PREFIX}-origin-api-${STAGE}
```

For e.g in order to create `ptt-origin-ui-stable` run the script with:

```
PREFIX=ptt STAGE=stable TEAM=<team> ./provision-heroku-origin.sh
```

Note: This script assumes that Heroku CLI tool is installed and your are logged in https://devcenter.heroku.com/articles/heroku-cli

## Energy Attribute Certificates

Energy Attribute Certificates, or EACs, is an official document which guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles.

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs are mostly used to address sustainability reports regarding [Scope 2 emissions](https://en.wikipedia.org/wiki/Carbon_emissions_reporting#Scope_2:_Electricity_indirect_GHG_emissions).

## Deployment

For deployment instructions please refer to [Deployment](https://github.com/energywebfoundation/origin/wiki/Origin-Deployment) wiki page.

## Contribution guidelines

If you want to contribute to Origin, be sure to follow classic open source contribution guidelines (described below).

1. Commiting a change
    - Fork the repository
    - Make a change to repo code
    - Commit the change to the `master` branch
2. Pull request
    - Open a pull request from your fork `master` branch
    - Request code reviews from [@JosephBagaric](https://github.com/JosephBagaric), [@kosecki123](https://github.com/kosecki123), [@alexworker23](https://github.com/alexworker23) or [@ioncreature](https://github.com/ioncreature)
    - Once the PR is approved and the build passes, it will be merged to the master branch
