# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@3.0.0...@energyweb/device-registry@4.0.0) (2020-01-31)


### chore

* **device-registry:** rm locationservice logic ([0b669b1](https://github.com/energywebfoundation/origin/commit/0b669b18f8135d95ad89da64d2f2a4933dc6028b))


### Features

* add ability to add device group ([d01a9ed](https://github.com/energywebfoundation/origin/commit/d01a9ed1c7e474635f4ff342844fb94a8b4c3bc9))


### BREAKING CHANGES

* **device-registry:** LocationService has been moved to utils-general package





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@2.0.1...@energyweb/device-registry@3.0.0) (2020-01-17)


### chore

* **device-registry:** rename power property capacityWh to capacityInW ([48bfdf3](https://github.com/energywebfoundation/origin/commit/48bfdf335e4693af887bcba1ab497cb5a33f9324))


### BREAKING CHANGES

* **device-registry:** rename capacityWh to capacityInW





## [2.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@2.0.0...@energyweb/device-registry@2.0.1) (2020-01-07)

**Note:** Version bump only for package @energyweb/device-registry





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@1.0.2...@energyweb/device-registry@2.0.0) (2019-12-20)


### Features

* **device-registry:** add region and province offchain properties ([a98ceb2](https://github.com/energywebfoundation/origin/commit/a98ceb28fd7a7ff7da6253a0d4474846c30f04c4))
* **device-registry:** change device primary key to number instead of smart meter address ([dec7af9](https://github.com/energywebfoundation/origin/commit/dec7af9a6740c4641d87c50c01d4b501bec8fab4))
* **device-registry:** move LocationService to device-registry from utils-general ([5d7984b](https://github.com/energywebfoundation/origin/commit/5d7984b0897cfcd704947f0df6f5586f0b3a3685))
* **device-registry:** restrict device creation ([fc4cdb7](https://github.com/energywebfoundation/origin/commit/fc4cdb78858958af0ab73b1503da898db355a1b4))


### BREAKING CHANGES

* **device-registry:** add region and province offchain properties
* **device-registry:** change device primary key to number instead of smart meter address





## [1.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@1.0.1...@energyweb/device-registry@1.0.2) (2019-12-19)

**Note:** Version bump only for package @energyweb/device-registry





## [1.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@1.0.0...@energyweb/device-registry@1.0.1) (2019-12-17)


### Bug Fixes

* **device-registry:** use default block range when fetching events ([64f49c3](https://github.com/energywebfoundation/origin/commit/64f49c3d315269a1325d495423a692c40269ef1f))





# 1.0.0 (2019-12-12)


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
