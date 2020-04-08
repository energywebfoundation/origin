# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@5.1.1...@energyweb/device-registry@6.0.0) (2020-04-08)


### Bug Fixes

* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))


### chore

* **device-registry:** remove all off-chain components ([d11c834](https://github.com/energywebfoundation/origin/commit/d11c83486a89eab252a88dcf79054383f9ea5152))


### Features

* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))


### BREAKING CHANGES

* **device-registry:** The device registry is now entirely on-chain





## [5.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@5.1.0...@energyweb/device-registry@5.1.1) (2020-03-16)


### Bug Fixes

* **device-registry:** return empty when no smart meter readings ([924f9f1](https://github.com/energywebfoundation/origin/commit/924f9f180485c18891c5cfdeb973855235d565da))
* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))





# [5.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@5.0.1...@energyweb/device-registry@5.1.0) (2020-03-02)


### Features

* Off-chain smart meter readings ([4dfbff0](https://github.com/energywebfoundation/origin/commit/4dfbff036b20578f6c2d960328a52deb0f0dff15))





## [5.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@5.0.0...@energyweb/device-registry@5.0.1) (2020-02-12)

**Note:** Version bump only for package @energyweb/device-registry





# [5.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/device-registry@4.0.0...@energyweb/device-registry@5.0.0) (2020-02-04)


### Bug Fixes

* allow Device Manager to add new devices ([3caee18](https://github.com/energywebfoundation/origin/commit/3caee187814433debca8e83b24949d1765c1b750))
* deviceLogic tests ([c3f7af7](https://github.com/energywebfoundation/origin/commit/c3f7af7720fa959b3a582ceed16e8e443b580708))


### Features

* Move some Device properties to off-chain storage, remove on-chain proofs + remove unused Consuming Devices definition ([8b9424e](https://github.com/energywebfoundation/origin/commit/8b9424e3ed826f39db989bb8e2c7495c682a4c38))


### BREAKING CHANGES

* The Device.Entity API has changed.





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
