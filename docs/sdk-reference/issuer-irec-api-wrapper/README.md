@energyweb/issuer-irec-api-wrapper / [Exports](modules.md)

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

- [Table of Contents](#table-of-contents)
- [Packages](#packages)
  - [SDK Releases](#sdk-releases)
  - [Applications, Infrastructure and Demo](#applications-infrastructure-and-demo)
  - [Packages types](#packages-types)
    - [Stable](#stable)
    - [Canary](#canary)
    - [Preview](#preview)
- [Installation](#installation)
- [Build](#build)
- [Test](#test)
- [Run demo](#run-demo)
  - [Preparation](#preparation)
  - [Running](#running)
  - [Heroku environment provisioning](#heroku-environment-provisioning)
- [Energy Attribute Certificates](#energy-attribute-certificates)
- [Key modules and components](#key-modules-and-components)
  - [Key repositories](#key-repositories)
  - [Other components](#other-components)
- [Deployment](#deployment)
- [Contribution guidelines](#contribution-guidelines)

## Packages

### SDK Releases

| Package                                                               | Stable                                                                                                                                      | Canary                                                                                                                                         | Description                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@energyweb/device-registry`](/packages/device-registry)             | [![npm](https://img.shields.io/npm/v/@energyweb/device-registry.svg)](https://www.npmjs.com/package/@energyweb/device-registry)             | [![npm](https://img.shields.io/npm/v/@energyweb/device-registry/canary)](https://www.npmjs.com/package/@energyweb/device-registry)             | Library that contains information on renewable energy producing devices |
| [`@energyweb/issuer`](/packages/issuer)                               | [![npm](https://img.shields.io/npm/v/@energyweb/issuer.svg)](https://www.npmjs.com/package/@energyweb/issuer)                               | [![npm](https://img.shields.io/npm/v/@energyweb/issuer/canary)](https://www.npmjs.com/package/@energyweb/issuer)                               | Energy Attribute Certificates Issuer Module                             |
| [`@energyweb/origin-backend-client`](/packages/origin-backend-client) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend-client.svg)](https://www.npmjs.com/package/@energyweb/origin-backend-client) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend-client/canary)](https://www.npmjs.com/package/@energyweb/origin-backend-client) | Client library for interacting with the backend                         |
| [`@energyweb/origin-backend`](/packages/origin-backend)               | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend.svg)](https://www.npmjs.com/package/@energyweb/origin-backend)               | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend/canary)](https://www.npmjs.com/package/@energyweb/origin-backend)               | Example backend necessary for running Origin                            |
| [`@energyweb/exchange`](/packages/exchange)                           | [![npm](https://img.shields.io/npm/v/@energyweb/exchange.svg)](https://www.npmjs.com/package/@energyweb/exchange)                           | [![npm](https://img.shields.io/npm/v/@energyweb/exchange/canary)](https://www.npmjs.com/package/@energyweb/exchange)                           | A service project hosting order book based exchange                     |
| [`@energyweb/utils-general`](/packages/utils-general)                 | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general.svg)](https://www.npmjs.com/package/@energyweb/utils-general)                 | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general/canary)](https://www.npmjs.com/package/@energyweb/utils-general)                 | Utilities                                                               |

### Applications, Infrastructure and Demo

| Package                                                   | Description                                |
| --------------------------------------------------------- | ------------------------------------------ |
| [`@energyweb/origin-ui`](/packages/origin-ui)             | UI for Origin                              |
| [`@energyweb/solar-simulator`](/packages/solar-simulator) | Solar production and consumption simulator |
| [`@energyweb/migrations`](/packages/migrations)           | Deployment and configuration utilities     |

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

## Installation

Make sure have latest `yarn` package manager installed.

```shell
yarn
```

## Build

```shell
yarn build
```

## Test

```shell
yarn test
```

## Run demo

### Preparation

0. Make sure you are using Node 14.x.x
1. Install [Postgres](https://www.postgresql.org/download/) 12.x+ and create a new database named `origin`.

We recommend using Docker based setup as follows (requires psql command line tool installed):

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE origin"
```

2. Make sure you have created a `.env` file in the root of the monorepo and that all necessary variables are set.
   Use [`.env.example`](.env.example) as an example of how the `.env` file should look.

3. For custom DB credentials, ports, db name etc refer to https://github.com/energywebfoundation/origin/tree/master/packages/apps/origin-backend-app#development

### Running

After you have the `.env` file created, installed dependencies (`yarn`) and build completed (`yarn build`) run the following command:

```shell
yarn run:origin
```

Visit the UI at: http://localhost:3000.

### Heroku environment provisioning

For fast deployment to Heroku you can run the available script `provision-heroku-origin`

```
PREFIX=<name> STAGE=<stage> TEAM=<team> ./provision-heroku-origin.sh
```

Naming convention is for apps:

```
${PREFIX}-origin-sim-${STAGE}
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

## Key modules and components

Overview of architecture

### Key repositories

This section lists key entry points to start your journey with Origin.

1. [migrations](https://github.com/energywebfoundation/origin/tree/master/packages/migrations) - repository with build scripts that enable easy deployment of smart contracts to EWC, Volta or a local blockchain. Often used to demo and get to know features and capabilities of Origin.
2. [origin-backend](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend) - This repository is used to act as a backend service for off-chain data storage.
3. [origin-ui](https://github.com/energywebfoundation/origin/tree/master/packages/origin-ui) - frontend of the system needed to view data stored in smart contracts (on-chain) and in the backend (off-chain). To interact with the Origin frontend you'll need [MetaMask](https://metamask.io).

### Other components

1. [device-registry](https://github.com/energywebfoundation/origin/tree/master/packages/device-registry) - high-level library for creating and managing electricity producing and consuming devices.
2. [issuer](https://github.com/energywebfoundation/origin/tree/master/packages/issuer) - high-level library for issuing and transferring Energy Attribute Certificates.
3. [exchange](https://github.com/energywebfoundation/origin/tree/master/packages/exchange) - An orderbook-based exchange for trading Energy Attribute Certificates.
4. [utils-general](https://github.com/energywebfoundation/origin/tree/master/packages/utils-general) - Contains logic for more straightforward interaction with contracts, such as watching events. It is also a base layer for other libraries to build upon. It provides a foundation for things like off-chain data storage that is universal for all entities.
5. [solar-simulator](https://github.com/energywebfoundation/origin/tree/master/packages/solar-simulator) - This service simulates smart-meter readings based on example solar data from whole year in 15-mins intervals. Also allows you to generate the config based on data from public I-REC registry.

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
