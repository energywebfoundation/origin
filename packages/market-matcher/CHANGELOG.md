# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@2.0.2...@energyweb/market-matcher@2.1.0) (2019-12-19)


### Bug Fixes

* **market-matcher:** use fillAt ([4f57770](https://github.com/energywebfoundation/origin/commit/4f577702b3ab68f20e8c0a7ad46a083aaf74f57b))


### Features

* **market-matcher:** startup account check ([5c9364c](https://github.com/energywebfoundation/origin/commit/5c9364c40f2b95f63489f315abb6bfc2d4ae54de))





## [2.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@2.0.1...@energyweb/market-matcher@2.0.2) (2019-12-17)


### Bug Fixes

* **market-matcher:** skip parent certificates when loading certificates ([4fef14d](https://github.com/energywebfoundation/origin/commit/4fef14d1b1d30e4d891016eab59a8d0e46735702))





## [2.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@2.0.0...@energyweb/market-matcher@2.0.1) (2019-12-12)


### Bug Fixes

* retry yarn add when building dockerfiles ([#366](https://github.com/energywebfoundation/origin/issues/366)) ([551c1f5](https://github.com/energywebfoundation/origin/commit/551c1f526c4f04c79cf2d5e363feb7340d01e6f0))
* **market-matcher:** observe update event ([bf4ba4a](https://github.com/energywebfoundation/origin/commit/bf4ba4a183741791018b779cadeaeb8275377af6))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@1.3.3...@energyweb/market-matcher@2.0.0) (2019-11-26)


### Bug Fixes

* include contracts in the package ([#316](https://github.com/energywebfoundation/origin/issues/316)) ([9c9712b](https://github.com/energywebfoundation/origin/commit/9c9712ba3b2b4b82adb2c94a9fea1e72d0b076ec))
* **solar-simulator:** wait for market contract in mock readings ([f7e6c87](https://github.com/energywebfoundation/origin/commit/f7e6c87e10c8d62c7e5799fde629005e6eac87f3))
* fix Makefile build-canary ([3b630ff](https://github.com/energywebfoundation/origin/commit/3b630ffe4d08bb186792bb5bd0c5f2419677523d))


### chore

* release preparations ([#321](https://github.com/energywebfoundation/origin/issues/321)) ([b07fe10](https://github.com/energywebfoundation/origin/commit/b07fe106142ccddd295ca66287dba842ebd7dbf0))


### Features

* Add support for toggling between manual/automatic matcher ([#293](https://github.com/energywebfoundation/origin/issues/293)) ([0adde5e](https://github.com/energywebfoundation/origin/commit/0adde5e256bf4d41c6991764bb366648adfe78ca))
* **market-matcher:** time triggers ([#258](https://github.com/energywebfoundation/origin/issues/258)) ([d14e2d1](https://github.com/energywebfoundation/origin/commit/d14e2d1b6e93ea1d812e8db7a2abe0457b05c3b6))
* **origin-ui:** add loader to request irec modal ([#241](https://github.com/energywebfoundation/origin/issues/241)) ([fbcbb19](https://github.com/energywebfoundation/origin/commit/fbcbb19c1808db3026b777fe9fe4808cdaf38732))
* **solar-simulator:** extended docker config ([#266](https://github.com/energywebfoundation/origin/issues/266)) ([b20e9af](https://github.com/energywebfoundation/origin/commit/b20e9af0ff4b43e46964dda1b71fd744d26891e5))


### BREAKING CHANGES

* part of the matcher logic has been moved to market-matcher-logic package

* chore(origin): semver update. added README.md
* Certificate logic related to the market moved to market package





## [1.3.3](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@1.3.2...@energyweb/market-matcher@1.3.3) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/origin/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/origin/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))
* **origin-ui:** fix direct navigation to certificates ([#204](https://github.com/energywebfoundation/origin/issues/204)) ([cb84bae](https://github.com/energywebfoundation/origin/commit/cb84bae7beaacecf3aeb4fade7b9289d9525758f))
* **origin-ui:** fix persisting demand location ([#205](https://github.com/energywebfoundation/origin/issues/205)) ([33eeb75](https://github.com/energywebfoundation/origin/commit/33eeb75a3866667fa2ecbb67b5eb5b4943e28693))





## [1.3.2](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@1.3.1...@energyweb/market-matcher@1.3.2) (2019-10-30)


### Bug Fixes

* fix event-listener and simulator configuration ([#191](https://github.com/energywebfoundation/origin/issues/191)) ([337215e](https://github.com/energywebfoundation/origin/commit/337215ee420d1f852ef29c97e7267ea4c3eb84c3))
* makefiles escaped variables ([052810c](https://github.com/energywebfoundation/origin/commit/052810c7ecf6343f044ed4e9922fd57107ab61e7))
* whitespaces ([3380deb](https://github.com/energywebfoundation/origin/commit/3380deb25954f8d82726f748c0f944bebed97ac0))





## [1.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@1.3.0...@energyweb/market-matcher@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/market-matcher





# [1.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/market-matcher@1.2.0...@energyweb/market-matcher@1.3.0) (2019-10-25)


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/origin/issues/137)) ([c428e7d](https://github.com/energywebfoundation/origin/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* certificate price is always per MWh ([#142](https://github.com/energywebfoundation/origin/issues/142)) ([a253036](https://github.com/energywebfoundation/origin/commit/a253036))
* Handle onSale certificates.  ([#40](https://github.com/energywebfoundation/origin/issues/40)) ([204cd8a](https://github.com/energywebfoundation/origin/commit/204cd8a))
* publish access configs ([bd4fa2b](https://github.com/energywebfoundation/origin/commit/bd4fa2b))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/origin/commit/ecc00a2))
* **market-matcher:** fetching offchain settlement options ([#160](https://github.com/energywebfoundation/origin/issues/160)) ([fe86e3e](https://github.com/energywebfoundation/origin/commit/fe86e3e))


### Features

* **origin-ui:** filter, search claimed certificates, bulk claim in inbox ([#44](https://github.com/energywebfoundation/origin/issues/44)) ([c80145a](https://github.com/energywebfoundation/origin/commit/c80145a))
* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/origin/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/origin/commit/b6c2a31))
* asset/demand location based matching ([#46](https://github.com/energywebfoundation/origin/issues/46)) ([00255bd](https://github.com/energywebfoundation/origin/commit/00255bd))
* Automatic demand matching ([#41](https://github.com/energywebfoundation/origin/issues/41)) ([d706629](https://github.com/energywebfoundation/origin/commit/d706629))
* certificate buying flow for matcher ([#161](https://github.com/energywebfoundation/origin/issues/161)) ([bb662c3](https://github.com/energywebfoundation/origin/commit/bb662c3))
* demand fill tracking ([#82](https://github.com/energywebfoundation/origin/issues/82)) ([2948e17](https://github.com/energywebfoundation/origin/commit/2948e17))
* matcher improvements  ([#159](https://github.com/energywebfoundation/origin/issues/159)) ([3ef5465](https://github.com/energywebfoundation/origin/commit/3ef5465))
* new demand creation view and asset types integration ([#14](https://github.com/energywebfoundation/origin/issues/14)) ([229e68b](https://github.com/energywebfoundation/origin/commit/229e68b))
* refactored market-matcher e2e tests ([#162](https://github.com/energywebfoundation/origin/issues/162)) ([ce31792](https://github.com/energywebfoundation/origin/commit/ce31792))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/origin/issues/20)) ([9cb4486](https://github.com/energywebfoundation/origin/commit/9cb4486))
