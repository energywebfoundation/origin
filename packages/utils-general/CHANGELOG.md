# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@2.1.0...@energyweb/utils-general@3.0.0) (2019-12-19)


### chore

* **utils-general:** replace Compliance enums with a type ([603502c](https://github.com/energywebfoundation/origin/commit/603502c40bf4b7fa467fb7e51495365af0a4923a))


### BREAKING CHANGES

* **utils-general:** The Compliance enum has been replaced with a simple string-based compliance definition





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@2.0.0...@energyweb/utils-general@2.1.0) (2019-12-17)


### Features

* **utils-general:** added createFilter method ([90d72f8](https://github.com/energywebfoundation/origin/commit/90d72f823c25d96f58c713a49a2050532d66a8c5))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@1.4.0...@energyweb/utils-general@2.0.0) (2019-12-12)


* [FIX] Backend hash storing (#341) ([b239101](https://github.com/energywebfoundation/origin/commit/b239101f51cffd7e37c9ea51654a75804cf502ed)), closes [#341](https://github.com/energywebfoundation/origin/issues/341)


### Bug Fixes

* **deps:** update dependency jsonschema to v1.2.5 ([#336](https://github.com/energywebfoundation/origin/issues/336)) ([17ac397](https://github.com/energywebfoundation/origin/commit/17ac397805180fb40541cebd11462e1866eb740b))


### Features

* **utils-general:** add common types ([0bd53df](https://github.com/energywebfoundation/origin/commit/0bd53dfa5d766c06b4a946894cff17cc7cee2131))


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





# [1.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@1.3.1...@energyweb/utils-general@1.4.0) (2019-11-26)


### Bug Fixes

* **market:** Updating off-chain properties - Handle cases where on-chain transactions fail ([#318](https://github.com/energywebfoundation/origin/issues/318)) ([324e1ee](https://github.com/energywebfoundation/origin/commit/324e1ee8605a122c54a41bec752333b0ac56b8dd))
* **utils-general:** Alternative ways to extract asset location ([#317](https://github.com/energywebfoundation/origin/issues/317)) ([73d2e84](https://github.com/energywebfoundation/origin/commit/73d2e842f043d019194f42eb5abf3b4a9494a72a))


### Features

* **origin-ui:** Add process indicator while executing tx ([#256](https://github.com/energywebfoundation/origin/issues/256)) ([21e1649](https://github.com/energywebfoundation/origin/commit/21e1649ad7ef026b7cf935701c966340f650789b))
* **origin-ui:** show certificate generation timeframe ([#287](https://github.com/energywebfoundation/origin/issues/287)) ([8c2bf43](https://github.com/energywebfoundation/origin/commit/8c2bf439970fcaea3ddfee5a9f92fdc2d4e435a5))





## [1.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@1.3.0...@energyweb/utils-general@1.3.1) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/origin/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/origin/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))
* **origin-ui:** fix persisting demand location ([#205](https://github.com/energywebfoundation/origin/issues/205)) ([33eeb75](https://github.com/energywebfoundation/origin/commit/33eeb75a3866667fa2ecbb67b5eb5b4943e28693))





# [1.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/utils-general@1.2.0...@energyweb/utils-general@1.3.0) (2019-10-25)


### Bug Fixes

* rm old prepare scripts ([a9aec09](https://github.com/energywebfoundation/origin/commit/a9aec098c36e3ed0763855bb8ab29789e6fbf118))
* use npm solc instead of downloading it every time ([#170](https://github.com/energywebfoundation/origin/issues/170)) ([e5ef574](https://github.com/energywebfoundation/origin/commit/e5ef574f6d297107606a1d035a56da01806a07d1))


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/origin/issues/137)) ([c428e7d](https://github.com/energywebfoundation/origin/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/origin/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/origin/commit/ccd9ed5))
* **utils-general:** force strings as IDs in Entity ([#19](https://github.com/energywebfoundation/origin/issues/19)) ([9417ff8](https://github.com/energywebfoundation/origin/commit/9417ff8))
* certificate price is always per MWh ([#142](https://github.com/energywebfoundation/origin/issues/142)) ([a253036](https://github.com/energywebfoundation/origin/commit/a253036))
* fix asset type overlap checking logic ([#94](https://github.com/energywebfoundation/origin/issues/94)) ([dc84251](https://github.com/energywebfoundation/origin/commit/dc84251))
* partial matching ([#90](https://github.com/energywebfoundation/origin/issues/90)) ([7ea2d5c](https://github.com/energywebfoundation/origin/commit/7ea2d5c))
* publish access configs ([bd4fa2b](https://github.com/energywebfoundation/origin/commit/bd4fa2b))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/origin/commit/ecc00a2))


### Features

* **origin-ui:** Duplicating and editing demands ([#32](https://github.com/energywebfoundation/origin/issues/32)) ([66cec2c](https://github.com/energywebfoundation/origin/commit/66cec2c))
* **origin-ui:** filter, search claimed certificates, bulk claim in inbox ([#44](https://github.com/energywebfoundation/origin/issues/44)) ([c80145a](https://github.com/energywebfoundation/origin/commit/c80145a))
* **origin-ui:** using in-browser private key ([#136](https://github.com/energywebfoundation/origin/issues/136)) ([818d2f5](https://github.com/energywebfoundation/origin/commit/818d2f5))
* Automatic demand matching ([#41](https://github.com/energywebfoundation/origin/issues/41)) ([d706629](https://github.com/energywebfoundation/origin/commit/d706629))
* **solar-simulator:** generate accounts from mnemonic ([#16](https://github.com/energywebfoundation/origin/issues/16)) ([89562ea](https://github.com/energywebfoundation/origin/commit/89562ea))
* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/origin/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/origin/commit/b6c2a31))
* asset/demand location based matching ([#46](https://github.com/energywebfoundation/origin/issues/46)) ([00255bd](https://github.com/energywebfoundation/origin/commit/00255bd))
* demand fill tracking ([#82](https://github.com/energywebfoundation/origin/issues/82)) ([2948e17](https://github.com/energywebfoundation/origin/commit/2948e17))
* demands filtering ([#26](https://github.com/energywebfoundation/origin/issues/26)) ([337e584](https://github.com/energywebfoundation/origin/commit/337e584))
* matcher improvements  ([#159](https://github.com/energywebfoundation/origin/issues/159)) ([3ef5465](https://github.com/energywebfoundation/origin/commit/3ef5465))
* new demand creation view and asset types integration ([#14](https://github.com/energywebfoundation/origin/issues/14)) ([229e68b](https://github.com/energywebfoundation/origin/commit/229e68b))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/origin/issues/20)) ([9cb4486](https://github.com/energywebfoundation/origin/commit/9cb4486))
* Use I-REC asset types across system ([#89](https://github.com/energywebfoundation/origin/issues/89)) ([2a4b45a](https://github.com/energywebfoundation/origin/commit/2a4b45a))
