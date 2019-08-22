<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <br>
</h1>

**Origin** is a set of toolkits that together provide a system for issuance and management of Energy Attribute Certificates (EACs). This repository is an entry point to Origin systems. It has a goal of explaining briefly the whole system and providing you with insight and info where to explore next.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`@energyweb/asset-registry`](/packages/asset-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/asset-registry.svg)](https://www.npmjs.com/package/@energyweb/asset-registry) | Contracts and client for Asset Registry |
| [`@energyweb/market-matcher`](/packages/market-matcher) | [![npm](https://img.shields.io/npm/v/@energyweb/market-matcher.svg)](https://www.npmjs.com/package/@energyweb/market-matcher) | Off-chain services for demand and supply matching |
| [`@energyweb/market`](/packages/market) | [![npm](https://img.shields.io/npm/v/@energyweb/market.svg)](https://www.npmjs.com/package/@energyweb/market) | Contacts and client for Origin Market |
| [`@energyweb/origin-ui`](/packages/origin-ui) | [![npm](https://img.shields.io/npm/v/@energyweb/origin-ui.svg)](https://www.npmjs.com/package/@energyweb/origin-ui) | UI for Origin |
| [`@energyweb/origin`](/packages/origin) | [![npm](https://img.shields.io/npm/v/@energyweb/origin.svg)](https://www.npmjs.com/package/@energyweb/origin) | Contracts and client Origin ceritifacts |
| [`@energyweb/user-registry`](/packages/user-registry) | [![npm](https://img.shields.io/npm/v/@energyweb/user-registry.svg)](https://www.npmjs.com/package/@energyweb/user-registry) | Contracts and client User Registry |
| [`@energyweb/utils-demo`](/packages/utils-demo) | [![npm](https://img.shields.io/npm/v/@energyweb/utils-demo.svg)](https://www.npmjs.com/package/@energyweb/utils-demo) | Demo deployment and configuration utilities |
| [`@energyweb/utils-general`](/packages/utils-general) | [![npm](https://img.shields.io/npm/v/@energyweb/utils-general.svg)](https://www.npmjs.com/package/@energyweb/utils-general) | Utilities |
| [`@energyweb/utils-testbackend`](/packages/utils-testbackend) | [![npm](https://img.shields.io/npm/v/@energyweb/utils-testbackend.svg)](https://www.npmjs.com/package/@energyweb/utils-testbackend) | Example backend for storing off-chain meta-data |

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

```shell
yarn run:origin
```

Find line like `@energyweb/utils-demo: [backend] PUT - OriginContractLookupMarketLookupMapping 0xb4ec89404c4a24f4c80d157ba9ad803cbc4db614` where the contracts address is used to visit the UI at

`http://localhost:3000/0xb4ec89404c4a24f4c80d157ba9ad803cbc4db614`
