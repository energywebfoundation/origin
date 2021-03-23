# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.1.3...@energyweb/issuer-api@0.2.0) (2021-03-23)


### Bug Fixes

* **deps:** update dependency @nestjs/schedule to v0.4.3 ([c3ade3b](https://github.com/energywebfoundation/origin/commit/c3ade3bf14d6b73dedc9c836f80d058b86e4246b))
* **deps:** update dependency @nestjs/swagger to v4.7.13 ([eba5075](https://github.com/energywebfoundation/origin/commit/eba5075f1578f2ae9d382cc4a955487eaa50d3bb))
* **deps:** update dependency @nestjs/swagger to v4.7.15 ([d58375c](https://github.com/energywebfoundation/origin/commit/d58375c74ffc3de71381e7bab7d65b5040340f6d))
* **deps:** update dependency @nestjs/swagger to v4.7.16 ([c240c31](https://github.com/energywebfoundation/origin/commit/c240c31cba4af09d322426ef09e80e89ea561f5d))
* **deps:** update dependency @nestjs/swagger to v4.8.0 ([f3baec9](https://github.com/energywebfoundation/origin/commit/f3baec98c786542549f87b0d5f2e8c3d425ea638))
* **deps:** update dependency ethers to v5.0.31 ([2c4a3a0](https://github.com/energywebfoundation/origin/commit/2c4a3a002e113ab28d1a452ed77b1b4b2a8436e6))
* **deps:** update dependency polly-js to v1.8.1 ([85e1d14](https://github.com/energywebfoundation/origin/commit/85e1d1427577c774c0af521ccfc8a04420a6c8c6))
* **deps:** update dependency rxjs to v6.6.6 ([8cbb567](https://github.com/energywebfoundation/origin/commit/8cbb567986449af7be85aab7fde3ea0eff6d3490))
* **deps:** update dependency typeorm to v0.2.31 ([b2d4b30](https://github.com/energywebfoundation/origin/commit/b2d4b30d90985597a1b55fb25860b5259769cffc))
* **deps:** update nest monorepo to v7.6.12 ([bacde48](https://github.com/energywebfoundation/origin/commit/bacde48160b73749f5e476b73bbafcef55902aba))
* **deps:** update nest monorepo to v7.6.14 ([9b0ca43](https://github.com/energywebfoundation/origin/commit/9b0ca4312c548681e752ba0e49d0a5a03350ae2e))
* **issuer-api:** check for device ownership when requesting certificates ([cfdd99c](https://github.com/energywebfoundation/origin/commit/cfdd99c1aa0b582fa26a6d44bd93dda06dadaa00))


### Features

* **issuer-api:** add claim dto ([facb6a0](https://github.com/energywebfoundation/origin/commit/facb6a0a7a44ef8f75af5d2bf41cb821ce10a72e))
* **issuer-api:** make claiming information available to everyone when fetching the certificate ([819da03](https://github.com/energywebfoundation/origin/commit/819da039a6214e91bcdd5b18deaed8236b53c66e))





## [0.1.3](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.1.2...@energyweb/issuer-api@0.1.3) (2021-02-12)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v0.6.3 ([4991dfb](https://github.com/energywebfoundation/origin/commit/4991dfb918ce7efb6d0a8bd72a011c825b3aec46))
* **deps:** update dependency ethers to v5.0.29 ([149041b](https://github.com/energywebfoundation/origin/commit/149041b4ca3648f1decf9e1acb5f7bb5d6fd721a))
* **deps:** update nest monorepo to v7.6.11 ([daee156](https://github.com/energywebfoundation/origin/commit/daee156b9c315c527311f0c78ffbdf4226b6785a))
* **issuer-api:** allow users with no blockchain address query public certificates ([3503fbc](https://github.com/energywebfoundation/origin/commit/3503fbc91f4708449469afc1f30a214a8aee68f7))
* **issuer-api:** private transfer commitment was always revealed in all certificates ([ce50125](https://github.com/energywebfoundation/origin/commit/ce5012524531c7f965cd23d40259221b9565c2ee))





## [0.1.2](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.1.1...@energyweb/issuer-api@0.1.2) (2020-12-04)

**Note:** Version bump only for package @energyweb/issuer-api





## [0.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.1.0...@energyweb/issuer-api@0.1.1) (2020-11-30)

**Note:** Version bump only for package @energyweb/issuer-api





# 0.1.0 (2020-11-20)


### Bug Fixes

* **deps:** update dependency @nestjs/swagger to v4.7.2 ([1b127f8](https://github.com/energywebfoundation/origin/commit/1b127f8504fb5a15bdcfc3abd2f0d4052cb26f73))
* **deps:** update dependency @nestjs/swagger to v4.7.3 ([1285463](https://github.com/energywebfoundation/origin/commit/128546350457dcedfba2087441dd5b93097cdced))
* **deps:** update dependency typeorm to v0.2.29 ([49232fb](https://github.com/energywebfoundation/origin/commit/49232fbd085e86a5e1df943aa917fe5ed86bff27))
* **deps:** update nest monorepo to v7.5.2 ([adf4996](https://github.com/energywebfoundation/origin/commit/adf49962f675ef88237af96baef0093057d0697f))


### Features

* **issuer-api:** expose BlockchainProperties settings ([a58c270](https://github.com/energywebfoundation/origin/commit/a58c270aecfe782e7dcfa2d1da7f1dd2512624b2))
* **issuer-api:** Initial commit for issuer-api ([b2fcdfa](https://github.com/energywebfoundation/origin/commit/b2fcdfa4110394cff67e2c650d243b72607c81b1))
* **issuer-api:** use queuing for certificate requests deployment ([fd31575](https://github.com/energywebfoundation/origin/commit/fd31575ae8717a8c0adf607a8fc6b3c2e34c9643))
* **issuer-api:** Validation for Entities and DTOs ([80285c3](https://github.com/energywebfoundation/origin/commit/80285c33fa649300da6f144496e27e07143e117d))
