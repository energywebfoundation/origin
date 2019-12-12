# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.4...@energyweb/origin-backend@2.0.0) (2019-12-12)


### Bug Fixes

* retry yarn add when building dockerfiles ([#366](https://github.com/energywebfoundation/origin/issues/366)) ([551c1f5](https://github.com/energywebfoundation/origin/commit/551c1f526c4f04c79cf2d5e363feb7340d01e6f0))


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





## [1.3.4](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.3...@energyweb/origin-backend@1.3.4) (2019-11-26)


### Bug Fixes

* **docker-compose:** map whole db dir for origin-backend ([#264](https://github.com/energywebfoundation/origin/issues/264)) ([75560e4](https://github.com/energywebfoundation/origin/commit/75560e4f52d2e5e1aeae61fe884737df0303b065))





## [1.3.3](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.2...@energyweb/origin-backend@1.3.3) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/origin/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/origin/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))
* normalize API urls, fix solar simulator ([#228](https://github.com/energywebfoundation/origin/issues/228)) ([aeed701](https://github.com/energywebfoundation/origin/commit/aeed701b8d541fb30a26f63b84d716bea61b7101))
* **origin-backend:** docker deployment fixes ([#203](https://github.com/energywebfoundation/origin/issues/203)) ([2fc7fe9](https://github.com/energywebfoundation/origin/commit/2fc7fe9cc4394496fcacc7f666ff27d97f0ca14c))
* **origin-backend:** prepare for docker setup ([#200](https://github.com/energywebfoundation/origin/issues/200)) ([ca363d0](https://github.com/energywebfoundation/origin/commit/ca363d0935a121d23e7b37ebcaa187904ebc813c))





## [1.3.2](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.1...@energyweb/origin-backend@1.3.2) (2019-10-30)


### Bug Fixes

* makefiles escaped variables ([052810c](https://github.com/energywebfoundation/origin/commit/052810c7ecf6343f044ed4e9922fd57107ab61e7))
* whitespaces ([3380deb](https://github.com/energywebfoundation/origin/commit/3380deb25954f8d82726f748c0f944bebed97ac0))





## [1.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.0...@energyweb/origin-backend@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/origin-backend





# 1.3.0 (2019-10-25)


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/origin/issues/137)) ([c428e7d](https://github.com/energywebfoundation/origin/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* **deps:** update dependency express to v4.17.1 ([#63](https://github.com/energywebfoundation/ew-utils-testbackend/issues/63)) ([1bcac38](https://github.com/energywebfoundation/ew-utils-testbackend/commit/1bcac38))
* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/ew-utils-testbackend/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/ew-utils-testbackend/commit/ccd9ed5))
* fix demo deployment and update dependencies ([#84](https://github.com/energywebfoundation/ew-utils-testbackend/issues/84)) ([5d366e6](https://github.com/energywebfoundation/ew-utils-testbackend/commit/5d366e6))
* publish access configs ([bd4fa2b](https://github.com/energywebfoundation/ew-utils-testbackend/commit/bd4fa2b))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/ew-utils-testbackend/commit/ecc00a2))


### Features

* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/ew-utils-testbackend/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/ew-utils-testbackend/commit/b6c2a31))
* consuming assets unique storage ([#86](https://github.com/energywebfoundation/ew-utils-testbackend/issues/86)) ([226eadf](https://github.com/energywebfoundation/ew-utils-testbackend/commit/226eadf))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/ew-utils-testbackend/issues/20)) ([9cb4486](https://github.com/energywebfoundation/ew-utils-testbackend/commit/9cb4486))
