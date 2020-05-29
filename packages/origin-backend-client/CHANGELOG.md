# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@6.0.0...@energyweb/origin-backend-client@6.0.1) (2020-05-29)


### Bug Fixes

* change URL to fetch invitations for organization ([cc0b238](https://github.com/energywebfoundation/origin/commit/cc0b238966cf8e6e3b14b485f2d4e4b6e7cec865))
* endpoint for fetching invitations for an organization ([57e11d9](https://github.com/energywebfoundation/origin/commit/57e11d9c8b09739ff443389c71dae6c31e4bb6d3))
* ownership commitments permissions + store original requestor ([1751d30](https://github.com/energywebfoundation/origin/commit/1751d3009d11f92d23bc9834632ef5b0ffb5bcee))





# [6.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@5.0.1...@energyweb/origin-backend-client@6.0.0) (2020-05-15)


### chore

* **origin-backend-client:** replace UserRegisterData ([52e9674](https://github.com/energywebfoundation/origin/commit/52e967480c426bc2aa9cc0f59b8c676ca17a4474))
* **origin-backend-client:** rm autopublish remaining code ([9f97d04](https://github.com/energywebfoundation/origin/commit/9f97d040679e95c300f0a02fd85f18ef7e6091f5))


### Features

* add meterStats to Device for un/certified meter readings reference ([627d785](https://github.com/energywebfoundation/origin/commit/627d7855506f52cb70ee083844ef2664b9227a0b))
* Detect and store the whole CertificationRequest on the backend ([613eb28](https://github.com/energywebfoundation/origin/commit/613eb28eeae25ec414b393f61311dbfb679351d4))


### BREAKING CHANGES

* **origin-backend-client:** UserRegisterData type replace with UserRegistrationData
* **origin-backend-client:** autoPublish is not longer a member of IUser interface





## [5.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@5.0.0...@energyweb/origin-backend-client@5.0.1) (2020-04-24)


### Bug Fixes

* **origin-ui-core:** fix image upload when registering devices ([fcbfe00](https://github.com/energywebfoundation/origin/commit/fcbfe008670d0f030f6de953957229fd98432208))
* store certificate energy as a string (maximum 2^256-1) ([2a284a9](https://github.com/energywebfoundation/origin/commit/2a284a9ff3b362dfa41516995b1cadd4c5651194))





# [5.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@4.0.0...@energyweb/origin-backend-client@5.0.0) (2020-04-08)


### Bug Fixes

* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* enable editing account settings ([b058828](https://github.com/energywebfoundation/origin/commit/b058828cafe8e07f0d5b921f8d0c59efc4f67ee7))
* make ContractsLookup part of Configuration ([4fe28c4](https://github.com/energywebfoundation/origin/commit/4fe28c4a79dc17658b067d519c6f0288a6243198))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))


### chore

* **device-registry:** remove all off-chain components ([d11c834](https://github.com/energywebfoundation/origin/commit/d11c83486a89eab252a88dcf79054383f9ea5152))


### Features

* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* add posting certificates for sale ([84a141a](https://github.com/energywebfoundation/origin/commit/84a141a9868102f1d012170926c2439069716783))
* **issuer:** approval process for private transfers ([b285bfd](https://github.com/energywebfoundation/origin/commit/b285bfdc4c7807a619ded163cc49a83b7545eb88))
* New CertificationRequest structure + use ContractsLookup instead of MarketContractLookup ([cb380c0](https://github.com/energywebfoundation/origin/commit/cb380c05986ee5e8f8fb1398e225ee54147a3936))
* support storing OwnershipCommitments off-chain ([6586895](https://github.com/energywebfoundation/origin/commit/658689556bb22a011e5dc947cf288f0b4c2cebcb))


### BREAKING CHANGES

* **device-registry:** The device registry is now entirely on-chain





# [4.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@3.3.0...@energyweb/origin-backend-client@4.0.0) (2020-03-16)


### Bug Fixes

* **deps:** update dependency ws to v7.2.3 ([14b2218](https://github.com/energywebfoundation/origin/commit/14b2218ad5df9b5873d59f70b317cbc3f5d8b158))
* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))
* **deps:** update dependency ws to v7.2.2 ([f04bd68](https://github.com/energywebfoundation/origin/commit/f04bd684c34ca65cf1096eaae2de1aae28170e01))


### Features

* add ExternalDeviceIdTypes to OriginConfiguration + unify all configuration items into one db table ([1469e32](https://github.com/energywebfoundation/origin/commit/1469e32ea369daf7f1b910c201670836248914ff))


### BREAKING CHANGES

* Configuration Client now works differently





# [3.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@3.2.0...@energyweb/origin-backend-client@3.3.0) (2020-03-02)


### Features

* Off-chain smart meter readings ([4dfbff0](https://github.com/energywebfoundation/origin/commit/4dfbff036b20578f6c2d960328a52deb0f0dff15))





# [3.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client@3.1.0...@energyweb/origin-backend-client@3.2.0) (2020-02-12)


### Features

* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





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
