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
  <a href="https://travis-ci.com/energywebfoundation/origin"><img src="https://img.shields.io/travis/com/energywebfoundation/origin/master"/></a>
  <a href="https://github.com/renovatebot/renovate"><img src="https://badges.renovateapi.com/github/energywebfoundation/origin"/></a>
</p>

## Table of Contents
- [Packages](#packages)
- [Installation](#installation)
- [Energy Attribute Certificates](#energy-attribute-certificates)
- [Key modules and components](#key-modules-and-components)
- [Deployment](#deployment)
- [Contribution guidelines](#contribution-guidelines)

## Packages

### SDK Releases

| Package | Stable | Canary | Description |
| --- | --- | --- | --- |
| [`@energyweb/asset-registry`](/packages/asset-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/asset-registry.svg)](https://www.npmjs.com/package/@energyweb/asset-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/asset-registry/canary)](https://www.npmjs.com/package/@energyweb/asset-registry) | Contracts and client for the Asset Registry |
| [`@energyweb/market-matcher-core`](/packages/market-matcher-core) | [![npm](https://img.shields.io/npm/v/@energyweb/market-matcher-core.svg)](https://www.npmjs.com/package/@energyweb/market-matcher-core) | [![npm](https://img.shields.io/npm/v/@energyweb/market-matcher-core/canary)](https://www.npmjs.com/package/@energyweb/market-matcher-core) | Matching rules and logic for market-matcher |
| [`@energyweb/market`](/packages/market) | [![npm](https://img.shields.io/npm/v/@energyweb/market.svg)](https://www.npmjs.com/package/@energyweb/market) | [![npm](https://img.shields.io/npm/v/@energyweb/market/canary)](https://www.npmjs.com/package/@energyweb/market/canary) | Contracts and client for the Origin Marketplace |
| [`@energyweb/origin`](/packages/origin) | [![npm](https://img.shields.io/npm/v/@energyweb/origin.svg)](https://www.npmjs.com/package/@energyweb/origin) | [![npm](https://img.shields.io/npm/v/@energyweb/market/canary)](https://www.npmjs.com/package/@energyweb/market/canary) | Contracts and client Origin Issuer of certificates |
| [`@energyweb/origin-backend-client`](/packages/origin-backend-client) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend-client.svg)](https://www.npmjs.com/package/@energyweb/origin-backend-client) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend-client/canary)](https://www.npmjs.com/package/@energyweb/origin-backend-client) | Client library for off-chain data source |
| [`@energyweb/origin-backend`](/packages/origin-backend) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend.svg)](https://www.npmjs.com/package/@energyweb/origin-backend) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-backend/canary)](https://www.npmjs.com/package/@energyweb/origin-backend) | Example backend for storing off-chain meta-data |
| [`@energyweb/user-registry`](/packages/user-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/user-registry.svg)](https://www.npmjs.com/package/@energyweb/user-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/user-registry/canary)](https://www.npmjs.com/package/@energyweb/user-registry) | Contracts and client for the User Registry |
| [`@energyweb/utils-general`](/packages/utils-general) | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general.svg)](https://www.npmjs.com/package/@energyweb/utils-general) | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general/canary)](https://www.npmjs.com/package/@energyweb/utils-general) | Utilities |

### Applications, Infrastructure and Demo

| Package | Description |
| --- | --- |
| [`@energyweb/origin-ui`](/packages/origin-ui) | UI for Origin |
| [`@energyweb/market-matcher`](/packages/market-matcher) | Off-chain agent for demand and supply matching |
| [`@energyweb/solar-simulator`](/packages/solar-simulator) | Solar production and consumption simulator |
| [`@energyweb/event-listener`](/packages/event-listener) | Listens to Origin events, triggers actions on-chain and sends notifications |
| [`@energyweb/utils-demo`](/packages/utils-demo) | Demo deployment and configuration utilities |

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

Make sure you have created a `.env` file in the root of the monorepo and that all necessary variables are set.
Use [`.env.example`](.env.example) as an example of how the `.env` file should look.

After you have the `.env` file created, run the following command:

```shell
yarn run:origin
```

Visit the UI at: http://localhost:3000.

## Energy Attribute Certificates
Energy Attribute Certificates, or EACs, is an official document which guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles. 

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs are mostly used to address sustainability reports regarding [Scope 2 emissions](https://en.wikipedia.org/wiki/Carbon_emissions_reporting#Scope_2:_Electricity_indirect_GHG_emissions).

## Key modules and components
Overview of architecture

### Key repositories

This section lists key entry points to start your journey with Origin. 

1. [utils-demo](https://github.com/energywebfoundation/origin/tree/master/packages/utils-demo) - demo repository with build scripts that enable easy deployment of smart contracts to Tobalaba or local blockchain. Often used to demo and get to know features and capabilities of Origin. 
2. [origin-backend](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend) - Origin combines on and off-chain data storage. This repository is used to act as a backend service for off-chain data storage. You'll need this to run `utils-demo` (store data), and `origin-ui` to display stored data. 
3. [origin-ui](https://github.com/energywebfoundation/origin/tree/master/packages/origin-ui) - frontend of the system needed to view data stored in smart contracts (on-chain) and in the backend (off-chain). To interact Origin frontend you'll need [MetaMask](https://metamask.io).

### Other components

1. [user-registry](https://github.com/energywebfoundation/origin/tree/master/packages/user-registry) - high-level library to interact with user registry. Can be used to i. a. create new user or set user's role in the system.
2. [asset-registry](https://github.com/energywebfoundation/origin/tree/master/packages/asset-registry) - high-level library for creating and managing electricity producing and consuming assets. Depends on [user-registry](https://github.com/energywebfoundation/origin/tree/master/packages/user-registry), because only user with Asset Manager role can be owner of asset. 
3. [origin](https://github.com/energywebfoundation/origin/tree/master/packages/origin) - a heart of Origin systems, contains logic for storing and transferring Energy Attribute Certificates (as a form of unique [ERC721](http://erc721.org/) tokens).
4. [market](https://github.com/energywebfoundation/origin/tree/master/packages/market) - a library that allows to create demand (for buyers), supply (for sellers) and agreements between buyers and sellers. It also extends the `Certificate` from [origin](https://github.com/energywebfoundation/origin/tree/master/packages/origin) and creates `PurchasableCertificate`s that can be sold on the marketplace.
5. [market-matcher](https://github.com/energywebfoundation/origin/tree/master/packages/market-matcher) - the most important part of marketplace, guarantees automatic matching of supply and demand between sellers and buyers. Matching rules can be highly customized and afterwards the algorithm can be tested by running matching simulator.
6. [utils-general](https://github.com/energywebfoundation/origin/tree/master/packages/utils-general) - Contains logic for more straightforward interaction with contracts, such as watching events. It is also a base layer for other libraries to build upon. It provides a foundation for things like off-chain data storage that is universal for all entities.
7. [solar-simulator](https://github.com/energywebfoundation/origin/tree/master/packages/solar-simulator) - This service simulates smart-meter readings based on example solar data from whole year in 15-mins intervals. Also allows you to generate the config based on data from public I-REC registry.
8. [event-listener](https://github.com/energywebfoundation/origin/tree/master/packages/event-listener) - Event listeners listen to events on the blockchain and react accordingly.

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
    - Request code reviews from [@Kuzirashi](https://github.com/Kuzirashi), [@JosephBagaric](https://github.com/JosephBagaric) or [@kosecki123](https://github.com/kosecki123)
    - Once the PR is approved and the build passes, it will be merged to the master branch
