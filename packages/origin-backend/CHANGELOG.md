# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.7.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.7.0...@energyweb/origin-backend@3.7.1) (2020-02-17)

**Note:** Version bump only for package @energyweb/origin-backend





# [3.7.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.6.0...@energyweb/origin-backend@3.7.0) (2020-02-17)


### Bug Fixes

* **deps:** update dependency @nestjs/config to ^0.2.0 ([5f8f814](https://github.com/energywebfoundation/origin/commit/5f8f814114b3ae42611150c0a55e9721a7672e01))


### Features

* **origin-backend:** exchange module import ([16417a4](https://github.com/energywebfoundation/origin/commit/16417a4c6c8728f2274a165859c5b119dc517e9a))





# [3.6.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.5.0...@energyweb/origin-backend@3.6.0) (2020-02-12)


### Bug Fixes

* **deps:** pin dependencies ([2088944](https://github.com/energywebfoundation/origin/commit/20889448a7923ac3c459806a119faae47645d8ba))
* **origin-backend:** .env file location ([ae0a812](https://github.com/energywebfoundation/origin/commit/ae0a8125bf38a030956fb9ecea74e591d30f9434))
* fix demand matching and saving demand partially filled events ([6462129](https://github.com/energywebfoundation/origin/commit/646212912192599a52454d3e498bf73c4314a0ac))


### Features

* **exchange:** forwarded integration. refactoring ([b2d8ac0](https://github.com/energywebfoundation/origin/commit/b2d8ac0e70a298e790e9115a9dfddaa98921ec82))
* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





# [3.5.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.4.0...@energyweb/origin-backend@3.5.0) (2020-02-04)


### Bug Fixes

* **deps:** update nest monorepo to v6.11.5 ([0ddc961](https://github.com/energywebfoundation/origin/commit/0ddc9619933b5dd0585c4767b7229bf502e55ccf))


### Features

* add a WebSocket-based event gateway to the backend + create entities for Demand and Device ([af703ce](https://github.com/energywebfoundation/origin/commit/af703ce9065ea2dc3c2034ca571b563886d12a55))
* email notifications for organization status change, member invitation and removal ([a2f0dae](https://github.com/energywebfoundation/origin/commit/a2f0dae5dab021980c702dc339654d52af2db47d))





# [3.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.3.0...@energyweb/origin-backend@3.4.0) (2020-01-31)


### Bug Fixes

* **deps:** update dependency axios to v0.19.1 ([40aa752](https://github.com/energywebfoundation/origin/commit/40aa7522c28cb2f6c32608669f154633be749649))
* **deps:** update dependency axios to v0.19.2 ([696eb46](https://github.com/energywebfoundation/origin/commit/696eb46fd2c7d26c223baaaf9f75d7943fc71517))


### Features

* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
* **origin-backend:** implement organization invitation ([b6d6609](https://github.com/energywebfoundation/origin/commit/b6d6609f0031c51e7a6943590b60607e1035ede4))





# [3.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.2.0...@energyweb/origin-backend@3.3.0) (2020-01-17)


### Bug Fixes

* **origin-backend:** add default config value ([49f3d50](https://github.com/energywebfoundation/origin/commit/49f3d50c5f9e938e5597e54d490879d2d19c671d))
* **origin-backend:** change test command ([41e4892](https://github.com/energywebfoundation/origin/commit/41e4892c90c84a5fb6ebfa125f0c0334b947599c))


### Features

* **origin-backend:** implement authentication ([baa9fea](https://github.com/energywebfoundation/origin/commit/baa9feaa3567b104bcf46134526097c8fc8b86fb))





# [3.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.1.0...@energyweb/origin-backend@3.2.0) (2020-01-07)


### Bug Fixes

* **origin-backend:** fix uploads directory location ([82ddef3](https://github.com/energywebfoundation/origin/commit/82ddef36f673406d808200a0117f41f32ba295eb))


### Features

* complete backend for registering organization ([b0dd715](https://github.com/energywebfoundation/origin/commit/b0dd71550011b97765362aeea87285a75f8119c1))
* **origin-backend:** add endpoint to save organizations ([7382725](https://github.com/energywebfoundation/origin/commit/738272579d8214315323e79d163fe51e14676155))





# [3.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.0.0...@energyweb/origin-backend@3.1.0) (2019-12-20)


### Features

* **origin-backend:** add possibility to store images ([faf0e74](https://github.com/energywebfoundation/origin/commit/faf0e748b1980a4502764fbe78dc555927b9b398))
* **origin-backend:** add support for storing Country ([99e754e](https://github.com/energywebfoundation/origin/commit/99e754e0f46fa4aae24379ba463513df94e9081a))





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@2.1.0...@energyweb/origin-backend@3.0.0) (2019-12-19)


### Features

* **origin-backend:** Change the way we approach POST methods + add a Compliance endpoint ([f7da2d5](https://github.com/energywebfoundation/origin/commit/f7da2d5c118a9169a123201375a254e5a203bedf))


### BREAKING CHANGES

* **origin-backend:** Changed the way we approach POST methods. Use request body parameters instead of in-URL parameters





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@2.0.0...@energyweb/origin-backend@2.1.0) (2019-12-17)


### Features

* **origin-backend:** New endpoint: Currency ([86b59db](https://github.com/energywebfoundation/origin/commit/86b59dbab4f25f3c2b756c97b8c5a72bfa3f7eda))





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
