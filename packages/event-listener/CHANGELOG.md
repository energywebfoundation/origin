# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.3.0...@energyweb/event-listener@3.4.0) (2020-02-12)


### Features

* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





# [3.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.2.2...@energyweb/event-listener@3.3.0) (2020-02-04)


### Features

* email notifications for organization status change, member invitation and removal ([a2f0dae](https://github.com/energywebfoundation/origin/commit/a2f0dae5dab021980c702dc339654d52af2db47d))





## [3.2.2](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.2.1...@energyweb/event-listener@3.2.2) (2020-01-31)

**Note:** Version bump only for package @energyweb/event-listener





## [3.2.1](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.2.0...@energyweb/event-listener@3.2.1) (2020-01-17)

**Note:** Version bump only for package @energyweb/event-listener





# [3.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.1.0...@energyweb/event-listener@3.2.0) (2020-01-07)


### Bug Fixes

* **deps:** update dependency nodemailer to v6.4.2 ([f1b9044](https://github.com/energywebfoundation/origin/commit/f1b90448726de8b2001bd7e363ab37a85b91cd23))


### Features

* **event-listener:** listen to changes in device status and notify the user ([c704188](https://github.com/energywebfoundation/origin/commit/c704188c710f27bbc101c981465866740f346894))





# [3.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.0.2...@energyweb/event-listener@3.1.0) (2019-12-20)


### Bug Fixes

* **event-listener:** adjust to device-registry region, province changes ([2428ba4](https://github.com/energywebfoundation/origin/commit/2428ba4cab33732cef25b80620b598a4f2cc09d2))


### Features

* add region and province form fields to device registration ([f71feff](https://github.com/energywebfoundation/origin/commit/f71feff224a087459d4d36f938feae82c8f7ff48))





## [3.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.0.1...@energyweb/event-listener@3.0.2) (2019-12-19)

**Note:** Version bump only for package @energyweb/event-listener





## [3.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@3.0.0...@energyweb/event-listener@3.0.1) (2019-12-17)

**Note:** Version bump only for package @energyweb/event-listener





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@2.0.0...@energyweb/event-listener@3.0.0) (2019-12-12)


### Bug Fixes

* retry yarn add when building dockerfiles ([#366](https://github.com/energywebfoundation/origin/issues/366)) ([551c1f5](https://github.com/energywebfoundation/origin/commit/551c1f526c4f04c79cf2d5e363feb7340d01e6f0))
* **deps:** update dependency nodemailer to v6.4.1 ([6db3ae4](https://github.com/energywebfoundation/origin/commit/6db3ae45f76605b19525a95a7f2dae9c6de6e646))


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





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@1.3.3...@energyweb/event-listener@2.0.0) (2019-11-26)


### Bug Fixes

* include contracts in the package ([#316](https://github.com/energywebfoundation/origin/issues/316)) ([9c9712b](https://github.com/energywebfoundation/origin/commit/9c9712ba3b2b4b82adb2c94a9fea1e72d0b076ec))
* **solar-simulator:** wait for market contract in mock readings ([f7e6c87](https://github.com/energywebfoundation/origin/commit/f7e6c87e10c8d62c7e5799fde629005e6eac87f3))
* fix Makefile build-canary ([3b630ff](https://github.com/energywebfoundation/origin/commit/3b630ffe4d08bb186792bb5bd0c5f2419677523d))
* **event-listener:** fix npm package ([#261](https://github.com/energywebfoundation/origin/issues/261)) ([7a52739](https://github.com/energywebfoundation/origin/commit/7a5273945d243937af379129738a25c29afb5fdc))


### chore

* **event-listener:** update README with new functionality ([1cbd37a](https://github.com/energywebfoundation/origin/commit/1cbd37ae5534a2a7054234af6e1b58e938a30542))


### Features

* Add support for toggling between manual/automatic matcher ([#293](https://github.com/energywebfoundation/origin/issues/293)) ([0adde5e](https://github.com/energywebfoundation/origin/commit/0adde5e256bf4d41c6991764bb366648adfe78ca))
* **origin-ui:** add loader to request irec modal ([#241](https://github.com/energywebfoundation/origin/issues/241)) ([fbcbb19](https://github.com/energywebfoundation/origin/commit/fbcbb19c1808db3026b777fe9fe4808cdaf38732))
* **solar-simulator:** extended docker config ([#266](https://github.com/energywebfoundation/origin/issues/266)) ([b20e9af](https://github.com/energywebfoundation/origin/commit/b20e9af0ff4b43e46964dda1b71fd744d26891e5))


### BREAKING CHANGES

* **event-listener:** event-listener now requires a private key to function properly





## [1.3.3](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@1.3.2...@energyweb/event-listener@1.3.3) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/origin/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/origin/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))





## [1.3.2](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@1.3.1...@energyweb/event-listener@1.3.2) (2019-10-30)

**Note:** Version bump only for package @energyweb/event-listener





## [1.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@1.3.0...@energyweb/event-listener@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/event-listener





# [1.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/event-listener@1.2.0...@energyweb/event-listener@1.3.0) (2019-10-25)


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/origin/issues/137)) ([c428e7d](https://github.com/energywebfoundation/origin/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* **deps:** update dependency express to v4.17.1 ([#63](https://github.com/energywebfoundation/origin/issues/63)) ([1bcac38](https://github.com/energywebfoundation/origin/commit/1bcac38))
* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/origin/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/origin/commit/ccd9ed5))
* **deps:** update dependency nodemailer to v6.3.1 ([#132](https://github.com/energywebfoundation/origin/issues/132)) ([8f77660](https://github.com/energywebfoundation/origin/commit/8f77660))
* **event-listener:** .env overwrite fix ([#115](https://github.com/energywebfoundation/origin/issues/115)) ([a46a7a6](https://github.com/energywebfoundation/origin/commit/a46a7a6))
* certificate price is always per MWh ([#142](https://github.com/energywebfoundation/origin/issues/142)) ([a253036](https://github.com/energywebfoundation/origin/commit/a253036))
* fix demo deployment and update dependencies ([#84](https://github.com/energywebfoundation/origin/issues/84)) ([5d366e6](https://github.com/energywebfoundation/origin/commit/5d366e6))
* **event-listener:** bypass multiple same market contracts ([#145](https://github.com/energywebfoundation/origin/issues/145)) ([b600415](https://github.com/energywebfoundation/origin/commit/b600415))
* **event-listener:** only listen to process.env.MARKET_CONTRACT_ADDRESS ([#164](https://github.com/energywebfoundation/origin/issues/164)) ([087da56](https://github.com/energywebfoundation/origin/commit/087da56))
* **solar-simulator:** save smart meter readings in the timezone of the asset ([#158](https://github.com/energywebfoundation/origin/issues/158)) ([a8c0480](https://github.com/energywebfoundation/origin/commit/a8c0480))


### Features

* asset/demand location based matching ([#46](https://github.com/energywebfoundation/origin/issues/46)) ([00255bd](https://github.com/energywebfoundation/origin/commit/00255bd))
* Automatic demand matching ([#41](https://github.com/energywebfoundation/origin/issues/41)) ([d706629](https://github.com/energywebfoundation/origin/commit/d706629))
* certificate buying flow for matcher ([#161](https://github.com/energywebfoundation/origin/issues/161)) ([bb662c3](https://github.com/energywebfoundation/origin/commit/bb662c3))
* demand fill tracking ([#82](https://github.com/energywebfoundation/origin/issues/82)) ([2948e17](https://github.com/energywebfoundation/origin/commit/2948e17))
* erc-test-contracts ([#24](https://github.com/energywebfoundation/origin/issues/24)) ([ad771ab](https://github.com/energywebfoundation/origin/commit/ad771ab))
* Event Listener ([#18](https://github.com/energywebfoundation/origin/issues/18)) ([ee44cbe](https://github.com/energywebfoundation/origin/commit/ee44cbe))
* new demand creation view and asset types integration ([#14](https://github.com/energywebfoundation/origin/issues/14)) ([229e68b](https://github.com/energywebfoundation/origin/commit/229e68b))
