# Packages

Origin consist of many publicly available NPM packages that allows developers to build their own RECs traceability and trading solutions. The goal is to allow implementers to pick and chose from the suite of available SDK components as well as allow them to create custom implementations for e.g for other issuers like I-REC. 


By design SDK packages are loosely coupled which enables the possibility to implement solutions that consist of only part of the Origin features like:

- issuance only
- device registry only
- trading only

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    Origin source code is managed as the monorepo structure, all packages code are available in <b>packages/*</b> folder. Each of the packages is versioned independently.
  </p>
</div>

## SDK packages

Packages that contains core components for building Origin experience. 

**Core ** packages that contains abstract or issuer independent code

**I-REC ** packages that contains [I-REC](https://www.irecstandard.org/) specific implementations

Naming scheme:

- **api** suffix - packages that contains Nest.JS based API endpoints *for e.g @energyweb/origin-device-registry-api*
- **client** suffix - packages that contains auto-generated Typescript client libraries for **api** projects *for e.g @energyweb/origin-device-registry-api-client*
- **wrapper** suffix - packages that contains wrapper libraries for external APIs *for e.g @energyweb/issuer-irec-api-wrapper*

### Devices

Device registration related packages.

#### Core
Name | Description 
---|---
@energyweb/origin-device-registry-api| Origin device registry API
@energyweb/origin-energy-api|Smart meter reads data service
@energyweb/origin-ui-core|Core component for Origin based UI

#### I-REC
Name | Description
---|---
@energyweb/origin-device-registry-irec-form-api| Legacy I-REC device registry API
@energyweb/origin-device-registry-irec-local-api| I-REC device registry API
@energyweb/origin-ui-irec-core|Core component for Origin based UI

### Organizations

Organization registration and management related packages.

#### Core
Name | Description 
---|---
@energyweb/origin-backend | Core organizations, users, authentication API
@energyweb/origin-ui-core|Core component for Origin based UI

#### I-REC
Name | Description 
---|---
@energyweb/origin-organization-irec-api| I-REC organizations API
@energyweb/origin-ui-irec-core|Core component for Origin based UI

### Traceability

Issuance and transparency related packages.

#### Core
Name | Description
---|---
@energyweb/issuer | Core issuer package
@energyweb/issuer-api | Core issuer API
@energyweb/issuer-irec-api-wrapper | I-REC API client package
@energyweb/origin-ui-core|Core component for Origin based UI

#### I-REC

Name | Description
---|---
@energyweb/issuer-irec-api-wrapper | I-REC API client package
@energyweb/origin-ui-irec-core|Core component for Origin based UI

### Trade

RECs trading related packages.

#### Core
Name | Description
---|---
@energyweb/exchange | Core exchange API
@energyweb/exchange-core | Order book matching engine
@energyweb/exchange-io-erc1888 | ERC1888 deposits and withdrawals implementation
@energyweb/exchange-token-account | Deposit token accounts
@energyweb/exchange-ui-core | UI components for exchange

#### I-REC
Name | Description
---|---
@energyweb/exchange-core-irec | I-REC based product implementation
@energyweb/exchange-irec | I-REC based product and rules API


## Integration 

Packages that are used as the host (runner) packages that allow for various configurations.

Name | Description
---|---
@energyweb/origin-backend-app | API host project based on legacy I-REC processes
@energyweb/migrations | Migrations project with sample marketplace data
@energyweb/origin-backend-irec-app | API host project based on I-REC API based processes
@energyweb/migrations-irec | Migrations project with sample marketplace data for I-REC API based processes
@energyweb/origin-ui | API host for Origin UI project


## Tools

Name | Description
---|---
@energyweb/origin-backend-utils | Common utils
@energyweb/utils-general | Common utils