# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@3.0.0...@energyweb/origin-backend-client@3.1.0) (2020-02-04)


### Features

* Unify all data clients into an OffChainData definition ([6aff08d](https://github.com/energywebfoundation/origin/commit/6aff08d9a36eaec5c2e6a102f5c1979d8b459982))





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.2.3...@energyweb/origin-backend-client@3.0.0) (2020-01-31)


### Bug Fixes

* **deps:** update dependency axios to v0.19.1 ([40aa752](https://github.com/energywebfoundation/origin/commit/40aa7522c28cb2f6c32608669f154633be749649))
* **deps:** update dependency axios to v0.19.2 ([696eb46](https://github.com/energywebfoundation/origin/commit/696eb46fd2c7d26c223baaaf9f75d7943fc71517))


### Features

* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
* **origin-backend-client:** extend organization and user client functionality, remove mocks ([5ed33ce](https://github.com/energywebfoundation/origin/commit/5ed33ce32f34678e67f0398ba73e5c12efb3424c))


### BREAKING CHANGES

* **origin-backend-client:** remove backend client mocks from package





## [2.2.3](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.2.2...@energyweb/origin-backend-client@2.2.3) (2020-01-17)

**Note:** Version bump only for package @energyweb/origin-backend-client





## [2.2.2](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.2.1...@energyweb/origin-backend-client@2.2.2) (2020-01-07)

**Note:** Version bump only for package @energyweb/origin-backend-client





## [2.2.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.2.0...@energyweb/origin-backend-client@2.2.1) (2019-12-20)


### Bug Fixes

* **origin-backend-client:** make IConfigurationClient more general to support Country/Regions ([b42c0af](https://github.com/energywebfoundation/origin/commit/b42c0af75c526685b19c9951b6d467e42a7794cc))





# [2.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.1.0...@energyweb/origin-backend-client@2.2.0) (2019-12-19)


### Features

* **origin-backend-client:** add Compliance support ([cfdea37](https://github.com/energywebfoundation/origin/commit/cfdea373dcc7181e7665bb9dfcdb961b314513ca))





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@2.0.0...@energyweb/origin-backend-client@2.1.0) (2019-12-17)


### Features

* **origin-backend-client:** allow storing and getting Currency ([d7b8006](https://github.com/energywebfoundation/origin/commit/d7b8006eb4425f76a2493bf0a92d92be0876bb00))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@1.1.0...@energyweb/origin-backend-client@2.0.0) (2019-12-12)


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





# [1.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@1.0.1...@energyweb/origin-backend-client@1.1.0) (2019-11-26)


### Bug Fixes

* **market:** Updating off-chain properties - Handle cases where on-chain transactions fail ([#318](https://github.com/energywebfoundation/origin/issues/318)) ([324e1ee](https://github.com/energywebfoundation/origin/commit/324e1ee8605a122c54a41bec752333b0ac56b8dd))


### Features

* Add support for toggling between manual/automatic matcher ([#293](https://github.com/energywebfoundation/origin/issues/293)) ([0adde5e](https://github.com/energywebfoundation/origin/commit/0adde5e256bf4d41c6991764bb366648adfe78ca))





## 1.0.1 (2019-11-11)


### Bug Fixes

* fix saving MarketContractLookup URL ([#227](https://github.com/energywebfoundation/origin/issues/227)) ([1127487](https://github.com/energywebfoundation/origin/commit/11274874cbe3277e31736c95b2d2b7d406ba3b48))
* normalize API urls, fix solar simulator ([#228](https://github.com/energywebfoundation/origin/issues/228)) ([aeed701](https://github.com/energywebfoundation/origin/commit/aeed701b8d541fb30a26f63b84d716bea61b7101))
