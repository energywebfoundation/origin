# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.5](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.1.4...@energyweb/exchange-core@3.1.5) (2020-08-25)


### Bug Fixes

* **deps:** update dependency bn.js to v5.1.3 ([368d9f3](https://github.com/energywebfoundation/origin/commit/368d9f38229885cb233f5145938f75854f55ed7b))





## [3.1.4](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.1.3...@energyweb/exchange-core@3.1.4) (2020-08-12)

**Note:** Version bump only for package @energyweb/exchange-core





## [3.1.3](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.1.2...@energyweb/exchange-core@3.1.3) (2020-08-10)

**Note:** Version bump only for package @energyweb/exchange-core





## [3.1.2](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.1.1...@energyweb/exchange-core@3.1.2) (2020-08-06)


### Bug Fixes

* **deps:** update dependency rxjs to v6.6.2 ([1849e03](https://github.com/energywebfoundation/origin/commit/1849e030c7cce6bf4d4063f3c6d96d98fbb96041))





## [3.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.1.0...@energyweb/exchange-core@3.1.1) (2020-07-16)

**Note:** Version bump only for package @energyweb/exchange-core





# [3.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.0.4...@energyweb/exchange-core@3.1.0) (2020-07-08)


### Bug Fixes

* **deps:** update dependency rxjs to v6.6.0 ([851151d](https://github.com/energywebfoundation/origin/commit/851151dd110a2b11fc9b491e491c4a152aaac807))
* **exchange-core:** fix lint ([96335c6](https://github.com/energywebfoundation/origin/commit/96335c671ced5233548a5d56ccc63d3f0bc5b791))
* **exchange-core:** fix work around cast type to number before check pricePickStrategy ([9a4b16e](https://github.com/energywebfoundation/origin/commit/9a4b16e07d0133c975dd43fd44c3f32f8b46efbf))


### Features

* **exchange-core:** abstracted price picking strategies ([1f48cb2](https://github.com/energywebfoundation/origin/commit/1f48cb208078ffd107984f9fff05912f40140cb8))





## [3.0.4](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.0.3...@energyweb/exchange-core@3.0.4) (2020-06-16)

**Note:** Version bump only for package @energyweb/exchange-core





## [3.0.3](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.0.2...@energyweb/exchange-core@3.0.3) (2020-06-16)

**Note:** Version bump only for package @energyweb/exchange-core





## [3.0.2](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.0.1...@energyweb/exchange-core@3.0.2) (2020-05-29)


### Bug Fixes

* **deps:** update dependency bn.js to v5.1.2 ([abe9afb](https://github.com/energywebfoundation/origin/commit/abe9afba4c6ad4d02bd8afd044f49582423e1293))





## [3.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@3.0.0...@energyweb/exchange-core@3.0.1) (2020-05-15)

**Note:** Version bump only for package @energyweb/exchange-core





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@2.0.0...@energyweb/exchange-core@3.0.0) (2020-04-24)


### Bug Fixes

* **exchange-core:** fix matching termination ([ac8e593](https://github.com/energywebfoundation/origin/commit/ac8e5933b21dee5255da63571a29b16735dfe4ae))


### chore

* **exchange-core:** ask requires asset id to be set ([3535d2a](https://github.com/energywebfoundation/origin/commit/3535d2ab5d9a53b9079e6a6b9356033ffb210155))


### BREAKING CHANGES

* **exchange-core:** Asset contructor requires assetId: string to set





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@1.0.1...@energyweb/exchange-core@2.0.0) (2020-04-08)


### Bug Fixes

* **deps:** update dependency rxjs to v6.5.5 ([2c19e39](https://github.com/energywebfoundation/origin/commit/2c19e39552b2e68a91db9fc8b21127488a9cd576))
* **exchange-core:** [] should be equivalent to undefined for orderbook filtering and matching ([f7d374a](https://github.com/energywebfoundation/origin/commit/f7d374a407fa3e1e653fea5dac2605bb73891310))
* **exchange-core:** dont crash on filtering unspecified bids ([67c77b7](https://github.com/energywebfoundation/origin/commit/67c77b7e65dac5d7ba0e2ee34c1768f617497041))
* **exchange-core:** fix filtering unspecified bids on other fields ([db65aa8](https://github.com/energywebfoundation/origin/commit/db65aa8006588790d56f6fff0cfbbc4bd6816075))
* **exchange-core:** reported volume, pending actions clear, more consistency checks ([1bd4d60](https://github.com/energywebfoundation/origin/commit/1bd4d603361e07a887e33da5b2dea089c2492a1b))
* **exchnage-core:** in-order cancellations ([fcf8b80](https://github.com/energywebfoundation/origin/commit/fcf8b807ca53f2e59d74ebad2f09bed0b7ab981a))


### chore

* **exchange-core:** remove order status tracking ([cfe0684](https://github.com/energywebfoundation/origin/commit/cfe0684b782fb2d627cb6660eac7b78c24ca296e))


### Features

* **exchange-core:** add explicit ordebook filters ([56d7038](https://github.com/energywebfoundation/origin/commit/56d7038de159c98efb2c18cd927979f520d25411))
* **exchange-core:** direct buy orders ([27e8aa7](https://github.com/energywebfoundation/origin/commit/27e8aa7ed70fab15b350c0cc81d9317556a76c92))
* **exchange-core:** grid operator matching & filtering ([94d9109](https://github.com/energywebfoundation/origin/commit/94d9109f9e7ff1b7a2768494b2afbb9477175d62))
* **exchange-core:** validFrom filtered orderbook views ([f9b5886](https://github.com/energywebfoundation/origin/commit/f9b5886fcf2c826940cd3331226c9636c5ba4f83))
* **exchnage-core:** generation time matching and filtering ([9139d63](https://github.com/energywebfoundation/origin/commit/9139d63179dd9a7a2ec65cb8c2ea8a1cda012be8))


### BREAKING CHANGES

* **exchange-core:** OrderStatus enum is not longer a member of exchange-core package. Action results are now signalled via actionResults events





## [1.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@1.0.0...@energyweb/exchange-core@1.0.1) (2020-03-16)


### Bug Fixes

* **exchange-core:** sequential orderbook triggering ([0df82b9](https://github.com/energywebfoundation/origin/commit/0df82b9753176f7594c3666b9326317ee1cfe1db))





# [1.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@0.1.3...@energyweb/exchange-core@1.0.0) (2020-03-02)


### Bug Fixes

* **exchange-core:** prevent self trading ([7bec5f8](https://github.com/energywebfoundation/origin/commit/7bec5f855b9753c6b011e1a34fccedc0444029ce))


### Features

* **exchange:** use bn for trade and order volume ([478aecd](https://github.com/energywebfoundation/origin/commit/478aecd19f1be57394145e4c53da0926db10ed62))


### BREAKING CHANGES

* **exchange:** 'order.volume' and 'trade.volume' are now BN instead of number





## [0.1.3](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@0.1.2...@energyweb/exchange-core@0.1.3) (2020-02-17)

**Note:** Version bump only for package @energyweb/exchange-core





## [0.1.2](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@0.1.1...@energyweb/exchange-core@0.1.2) (2020-02-12)

**Note:** Version bump only for package @energyweb/exchange-core





## [0.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange-core@0.1.0...@energyweb/exchange-core@0.1.1) (2020-02-04)


### Bug Fixes

* **exchange-core:** multiple locations matching + tests ([e4d28b3](https://github.com/energywebfoundation/origin/commit/e4d28b337dbdfb42da1c584219acd92e2266bca3))





# 0.1.0 (2020-01-31)


### Bug Fixes

* **exchange-core:** fix overmatching when having bigger ask ([c077ab5](https://github.com/energywebfoundation/origin/commit/c077ab5eefe38a99e89d002e2fbfe761e793006e))
* **exchange-core:** vintage matching ([c274cc7](https://github.com/energywebfoundation/origin/commit/c274cc7d8e9377e273b21e11eb237b64b358f2a9))


### Features

* **exchange-core:** location matching ([1563fa5](https://github.com/energywebfoundation/origin/commit/1563fa55934ecff2f63f2aa4e57f58eb78883070))
* **exchange-core:** order book filtering ([8f41a3f](https://github.com/energywebfoundation/origin/commit/8f41a3fdb81e97938d8f55584336c5f5b8f6fdc4))
* **exchange-core:** product matching WIP ([26b5834](https://github.com/energywebfoundation/origin/commit/26b5834e81be8807701afe065728a3f5ec1ecfb1))
* **exchange-core:** single market mode ([4f725f4](https://github.com/energywebfoundation/origin/commit/4f725f4c8d483757bd88530f39f0e113c5bec7cb))
* **exchange-core:** vintage specification ([fcb60c6](https://github.com/energywebfoundation/origin/commit/fcb60c69bac6a45b1b4e8897044d4beddc6212fd))
