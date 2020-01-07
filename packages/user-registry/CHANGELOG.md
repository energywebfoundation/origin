# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.4](https://github.com/energywebfoundation/origin/compare/@energyweb/user-registry@2.0.3...@energyweb/user-registry@2.0.4) (2020-01-07)

**Note:** Version bump only for package @energyweb/user-registry





## [2.0.3](https://github.com/energywebfoundation/origin/compare/@energyweb/user-registry@2.0.2...@energyweb/user-registry@2.0.3) (2019-12-20)

**Note:** Version bump only for package @energyweb/user-registry





## [2.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/user-registry@2.0.1...@energyweb/user-registry@2.0.2) (2019-12-19)

**Note:** Version bump only for package @energyweb/user-registry





## [2.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/user-registry@2.0.0...@energyweb/user-registry@2.0.1) (2019-12-17)


### Bug Fixes

* **user-registry:** use default block range when fetching events ([f5d83bc](https://github.com/energywebfoundation/origin/commit/f5d83bcaa3864d0a43bf0fd45c145f6b08aaaded))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/user-registry@1.4.0...@energyweb/user-registry@2.0.0) (2019-12-12)


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





# [1.4.0](https://github.com/energywebfoundation/ew-user-registry-lib/compare/@energyweb/user-registry@1.3.3...@energyweb/user-registry@1.4.0) (2019-11-26)


### Bug Fixes

* include contracts in the package ([#316](https://github.com/energywebfoundation/ew-user-registry-lib/issues/316)) ([9c9712b](https://github.com/energywebfoundation/ew-user-registry-lib/commit/9c9712ba3b2b4b82adb2c94a9fea1e72d0b076ec))
* **monorepo:** volta deployments ([#249](https://github.com/energywebfoundation/ew-user-registry-lib/issues/249)) ([432abae](https://github.com/energywebfoundation/ew-user-registry-lib/commit/432abae72a4a8bd39a7dd9a975585b22c36d9b47))


### Features

* **origin-ui:** add loader to request irec modal ([#241](https://github.com/energywebfoundation/ew-user-registry-lib/issues/241)) ([fbcbb19](https://github.com/energywebfoundation/ew-user-registry-lib/commit/fbcbb19c1808db3026b777fe9fe4808cdaf38732))





## [1.3.3](https://github.com/energywebfoundation/ew-user-registry-lib/compare/@energyweb/user-registry@1.3.2...@energyweb/user-registry@1.3.3) (2019-11-11)


### Bug Fixes

* fix running on Windows ([#222](https://github.com/energywebfoundation/ew-user-registry-lib/issues/222)) ([81f8c19](https://github.com/energywebfoundation/ew-user-registry-lib/commit/81f8c190c9841eaa7a0e5ed984cf0aa110f15e18))
* fix yarn clean command ([#224](https://github.com/energywebfoundation/ew-user-registry-lib/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/ew-user-registry-lib/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))





## [1.3.2](https://github.com/energywebfoundation/ew-user-registry-lib/compare/@energyweb/user-registry@1.3.1...@energyweb/user-registry@1.3.2) (2019-10-30)

**Note:** Version bump only for package @energyweb/user-registry





## [1.3.1](https://github.com/energywebfoundation/ew-user-registry-lib/compare/@energyweb/user-registry@1.3.0...@energyweb/user-registry@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/user-registry





# [1.3.0](https://github.com/energywebfoundation/ew-user-registry-lib/compare/@energyweb/user-registry@1.2.0...@energyweb/user-registry@1.3.0) (2019-10-25)


### Bug Fixes

* use npm solc instead of downloading it every time ([#170](https://github.com/energywebfoundation/ew-user-registry-lib/issues/170)) ([e5ef574](https://github.com/energywebfoundation/ew-user-registry-lib/commit/e5ef574f6d297107606a1d035a56da01806a07d1))


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/ew-user-registry-lib/issues/137)) ([c428e7d](https://github.com/energywebfoundation/ew-user-registry-lib/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* fix missing account when setting roles in createUser ([#25](https://github.com/energywebfoundation/ew-user-registry-lib/issues/25)) ([095c213](https://github.com/energywebfoundation/ew-user-registry-lib/commit/095c213))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/ew-user-registry-lib/commit/ecc00a2))
* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/ew-user-registry-lib/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/ew-user-registry-lib/commit/ccd9ed5))


### Features

* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/ew-user-registry-lib/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/ew-user-registry-lib/commit/b6c2a31))
* demand fill tracking ([#82](https://github.com/energywebfoundation/ew-user-registry-lib/issues/82)) ([2948e17](https://github.com/energywebfoundation/ew-user-registry-lib/commit/2948e17))
* demands filtering ([#26](https://github.com/energywebfoundation/ew-user-registry-lib/issues/26)) ([337e584](https://github.com/energywebfoundation/ew-user-registry-lib/commit/337e584))
* Event Listener ([#18](https://github.com/energywebfoundation/ew-user-registry-lib/issues/18)) ([ee44cbe](https://github.com/energywebfoundation/ew-user-registry-lib/commit/ee44cbe))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/ew-user-registry-lib/issues/20)) ([9cb4486](https://github.com/energywebfoundation/ew-user-registry-lib/commit/9cb4486))
