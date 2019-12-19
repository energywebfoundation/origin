# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/origin@3.0.1...@energyweb/origin@3.0.2) (2019-12-19)

**Note:** Version bump only for package @energyweb/origin





## [3.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin@3.0.0...@energyweb/origin@3.0.1) (2019-12-17)


### Bug Fixes

* **origin:** use default block range when fetching events ([bffafbc](https://github.com/energywebfoundation/origin/commit/bffafbc3886ab4e845a5bc0356c7862e805475ab))





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin@2.0.0...@energyweb/origin@3.0.0) (2019-12-12)


* [FIX] Backend hash storing (#341) ([b239101](https://github.com/energywebfoundation/origin/commit/b239101f51cffd7e37c9ea51654a75804cf502ed)), closes [#341](https://github.com/energywebfoundation/origin/issues/341)


### BREAKING CHANGES

* Changed the API endpoints from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* feat(utils-general): use the new URL structure when fetching off-chain data
* Changed the API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(user-registry): adjust to breaking changes
* Updated User API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(asset-registry): adjust to breaking changes
* Updated Asset API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(origin): fix constructor weird formatting

* fix(market): storing off-chain data references on-chain
* New contracts for PurchasableCertificate + Updated Market API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(event-listener): more understandable tests

* fix(event-listener): make scan interval faster for tests

* feat(origin-backend): use a simpler URL structure
* The URL structure of the API changed to only store hashes, omitting IDs, entity types and market lookup contracts used previously

* chore(origin-backend-client): use only POST methods instead of POST and PUT
* Use the .insert() method instead of .insertOrUpdate()

* chore(utils-general): use .insert instead of .insertOrUpdate

* fix(origin-backend): return 200 on POSTing the same entity

* chore(utils-general): remove abstract getUrl()

* chore(user-registry): remove specific getUrl()

* chore(device-registry): remove specific getUrl()

* chore(origin): remove specific getUrl()

* chore(market): remove specific getUrl()

* chore(monorepo): reorder test:serial

* fix(origin-backend): adjust tests to new POST behaviour

* chore(monorepo): Add an ADR for simplifying off-chain data storage





# [2.0.0](https://github.com/energywebfoundation/ew-origin-lib/compare/@energyweb/origin@1.3.3...@energyweb/origin@2.0.0) (2019-11-26)


### Bug Fixes

* include contracts in the package ([#316](https://github.com/energywebfoundation/ew-origin-lib/issues/316)) ([9c9712b](https://github.com/energywebfoundation/ew-origin-lib/commit/9c9712ba3b2b4b82adb2c94a9fea1e72d0b076ec))
* **monorepo:** build order ([b582839](https://github.com/energywebfoundation/ew-origin-lib/commit/b58283958289e5525739a8918bd2db6739e88b39))
* **monorepo:** volta deployments ([#249](https://github.com/energywebfoundation/ew-origin-lib/issues/249)) ([432abae](https://github.com/energywebfoundation/ew-origin-lib/commit/432abae72a4a8bd39a7dd9a975585b22c36d9b47))


### chore

* release preparations ([#321](https://github.com/energywebfoundation/ew-origin-lib/issues/321)) ([b07fe10](https://github.com/energywebfoundation/ew-origin-lib/commit/b07fe106142ccddd295ca66287dba842ebd7dbf0))


### Features

* **market:** add generation time range to the certificate ([#255](https://github.com/energywebfoundation/ew-origin-lib/issues/255)) ([e0be305](https://github.com/energywebfoundation/ew-origin-lib/commit/e0be3059869e0abfe6521600ef2dd0b5849fb83b))
* **origin-ui:** add loader to request irec modal ([#241](https://github.com/energywebfoundation/ew-origin-lib/issues/241)) ([fbcbb19](https://github.com/energywebfoundation/ew-origin-lib/commit/fbcbb19c1808db3026b777fe9fe4808cdaf38732))
* **origin-ui:** Add process indicator while executing tx ([#256](https://github.com/energywebfoundation/ew-origin-lib/issues/256)) ([21e1649](https://github.com/energywebfoundation/ew-origin-lib/commit/21e1649ad7ef026b7cf935701c966340f650789b))
* **origin-ui:** runtime Docker environment variables ([#259](https://github.com/energywebfoundation/ew-origin-lib/issues/259)) ([dc72ec8](https://github.com/energywebfoundation/ew-origin-lib/commit/dc72ec8047275de0cc9cb7427070cefe453c9e1e))


### BREAKING CHANGES

* part of the matcher logic has been moved to market-matcher-logic package

* chore(origin): semver update. added README.md
* Certificate logic related to the market moved to market package





## [1.3.3](https://github.com/energywebfoundation/ew-origin-lib/compare/@energyweb/origin@1.3.2...@energyweb/origin@1.3.3) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/ew-origin-lib/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/ew-origin-lib/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))
* **origin-ui:** fix certificate history ([#201](https://github.com/energywebfoundation/ew-origin-lib/issues/201)) ([2c4fbbb](https://github.com/energywebfoundation/ew-origin-lib/commit/2c4fbbb799014dd272de6a3f3ac98987a078f9bd))





## [1.3.2](https://github.com/energywebfoundation/ew-origin-lib/compare/@energyweb/origin@1.3.1...@energyweb/origin@1.3.2) (2019-10-30)

**Note:** Version bump only for package @energyweb/origin





## [1.3.1](https://github.com/energywebfoundation/ew-origin-lib/compare/@energyweb/origin@1.3.0...@energyweb/origin@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/origin





# [1.3.0](https://github.com/energywebfoundation/ew-origin-lib/compare/@energyweb/origin@1.2.0...@energyweb/origin@1.3.0) (2019-10-25)


### Bug Fixes

* use npm solc instead of downloading it every time ([#170](https://github.com/energywebfoundation/ew-origin-lib/issues/170)) ([e5ef574](https://github.com/energywebfoundation/ew-origin-lib/commit/e5ef574f6d297107606a1d035a56da01806a07d1))


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/ew-origin-lib/issues/137)) ([c428e7d](https://github.com/energywebfoundation/ew-origin-lib/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/ew-origin-lib/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/ew-origin-lib/commit/ccd9ed5))
* certificate price is always per MWh ([#142](https://github.com/energywebfoundation/ew-origin-lib/issues/142)) ([a253036](https://github.com/energywebfoundation/ew-origin-lib/commit/a253036))
* Handle onSale certificates.  ([#40](https://github.com/energywebfoundation/ew-origin-lib/issues/40)) ([204cd8a](https://github.com/energywebfoundation/ew-origin-lib/commit/204cd8a))
* publish access configs ([bd4fa2b](https://github.com/energywebfoundation/ew-origin-lib/commit/bd4fa2b))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/ew-origin-lib/commit/ecc00a2))


### Features

* **origin-ui:** filter, search claimed certificates, bulk claim in inbox ([#44](https://github.com/energywebfoundation/ew-origin-lib/issues/44)) ([c80145a](https://github.com/energywebfoundation/ew-origin-lib/commit/c80145a))
* asset/demand location based matching ([#46](https://github.com/energywebfoundation/ew-origin-lib/issues/46)) ([00255bd](https://github.com/energywebfoundation/ew-origin-lib/commit/00255bd))
* Automatic demand matching ([#41](https://github.com/energywebfoundation/ew-origin-lib/issues/41)) ([d706629](https://github.com/energywebfoundation/ew-origin-lib/commit/d706629))
* **origin-ui:** using in-browser private key ([#136](https://github.com/energywebfoundation/ew-origin-lib/issues/136)) ([818d2f5](https://github.com/energywebfoundation/ew-origin-lib/commit/818d2f5))
* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/ew-origin-lib/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/ew-origin-lib/commit/b6c2a31))
* certificate buying flow for matcher ([#161](https://github.com/energywebfoundation/ew-origin-lib/issues/161)) ([bb662c3](https://github.com/energywebfoundation/ew-origin-lib/commit/bb662c3))
* demand fill tracking ([#82](https://github.com/energywebfoundation/ew-origin-lib/issues/82)) ([2948e17](https://github.com/energywebfoundation/ew-origin-lib/commit/2948e17))
* erc-test-contracts ([#24](https://github.com/energywebfoundation/ew-origin-lib/issues/24)) ([ad771ab](https://github.com/energywebfoundation/ew-origin-lib/commit/ad771ab))
* new demand creation view and asset types integration ([#14](https://github.com/energywebfoundation/ew-origin-lib/issues/14)) ([229e68b](https://github.com/energywebfoundation/ew-origin-lib/commit/229e68b))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/ew-origin-lib/issues/20)) ([9cb4486](https://github.com/energywebfoundation/ew-origin-lib/commit/9cb4486))
