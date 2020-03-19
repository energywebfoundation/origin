# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.5.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.4.0...@energyweb/exchange@0.5.0) (2020-03-16)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v0.3.0 ([4cdd97b](https://github.com/energywebfoundation/origin/commit/4cdd97bf62bcee3249535f90ca573fb2024b5a98))
* **deps:** update dependency @nestjs/schedule to v0.3.0 ([2c0f313](https://github.com/energywebfoundation/origin/commit/2c0f3139d82d9c651543a0e812e098897ae43c3b))
* **deps:** update dependency @nestjs/swagger to v4.3.2 ([c8cf2fe](https://github.com/energywebfoundation/origin/commit/c8cf2fe4cce3772f4c38f0323019d93f44f68bf5))
* **deps:** update dependency @nestjs/typeorm to v6.3.4 ([f21e526](https://github.com/energywebfoundation/origin/commit/f21e526e68a2942a0cb50c4f5712531432d96279))
* **deps:** update nest monorepo to v6.11.11 ([8d93078](https://github.com/energywebfoundation/origin/commit/8d93078773c86dd04ffbf5419fa0b5fc94a6b7bf))
* **exchange:** downgrades typeorm to 0.2.22 due to start errors ([5322bf7](https://github.com/energywebfoundation/origin/commit/5322bf7a56ed2d9f2daebd62fe565c91024b0c51))
* **exchange:** use ProductDTO for complex searching ([1f7a33f](https://github.com/energywebfoundation/origin/commit/1f7a33fac1f41239aa90af1603b3964d647fe34e))


### Features

* **exchange:** orders endpoint, relations re-design, dtos refactoring ([5b3e7ce](https://github.com/energywebfoundation/origin/commit/5b3e7cecc29edee95ac23151c29202e28971dff3))





# [0.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.3.1...@energyweb/exchange@0.4.0) (2020-03-02)


### Bug Fixes

* **deps:** update dependency typeorm to v0.2.24 ([fb6c68b](https://github.com/energywebfoundation/origin/commit/fb6c68b324524fe814859f6274428ddc4f938762))
* **deps:** update nest monorepo to v6.11.8 ([2934e78](https://github.com/energywebfoundation/origin/commit/2934e780c8555383427cc7c8e22e69fff59ec10f))


### Features

* **exchange:** nest swagger compiler plugin for swagger metadata ([6742447](https://github.com/energywebfoundation/origin/commit/6742447c7863ede21a4bab92ae858420f3310d5a))
* **exchange:** return userId as part of orderbookdto ([84c3525](https://github.com/energywebfoundation/origin/commit/84c3525ca26898b07e26533d71e7a52ee360d91d))
* **origin-ui-core:** Bids and Asks UI list component ([c08a03b](https://github.com/energywebfoundation/origin/commit/c08a03b911642644f5acb870305ed1efd35e9ce7))





## [0.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.3.0...@energyweb/exchange@0.3.1) (2020-02-17)


### Bug Fixes

* **exchange:** set public access ([daab3af](https://github.com/energywebfoundation/origin/commit/daab3af80c2f5c05f54e93355e41bee3d95b65f8))





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.2.0...@energyweb/exchange@0.3.0) (2020-02-17)


### Bug Fixes

* **exchange:** add main section to package.json ([25e9bfc](https://github.com/energywebfoundation/origin/commit/25e9bfcce342480625da47ec7107299f15b1e59b))
* **exchange:** set status as error when no enough funds ([0906418](https://github.com/energywebfoundation/origin/commit/09064182f67a4e7432f442e16b3d560029a01b43))


### Features

* **exchange:** authentication ([aaef626](https://github.com/energywebfoundation/origin/commit/aaef62612a452855b5ea40c8e081c356083d5e44))
* **exchange:** deposit watcher, transfers endpoint ([f0f5500](https://github.com/energywebfoundation/origin/commit/f0f5500228cce0d45896e2cd53d43f75e714edec))
* **exchange:** start watcher from last known block, fix e2e test exit ([b81ac32](https://github.com/energywebfoundation/origin/commit/b81ac32260ab754b5808bc3ac8b99e4eb47766a0))
* **exchange:** withdrawal e2e tests ([84dcdfa](https://github.com/energywebfoundation/origin/commit/84dcdfa81dfed0c3179b5aa350176b6afb55df69))
* **exchange:** withdrawal processor WIP ([e56b1dc](https://github.com/energywebfoundation/origin/commit/e56b1dc011475efe8cba125c0f12bef3d117fc92))





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.1.1...@energyweb/exchange@0.2.0) (2020-02-12)


### Bug Fixes

* **deps:** pin dependencies ([2088944](https://github.com/energywebfoundation/origin/commit/20889448a7923ac3c459806a119faae47645d8ba))
* **exchange:** use confirmed deposits and any withdrawals for accounting ([dce8a9c](https://github.com/energywebfoundation/origin/commit/dce8a9ce77f7e12d12300dc6efbae95696226f52))


### Features

* **exchange:** account info based on trades and deposits ([b6f7dbd](https://github.com/energywebfoundation/origin/commit/b6f7dbd1d76bc4d3772940effb95fb7ab743f7d3))
* **exchange:** forwarded integration. refactoring ([b2d8ac0](https://github.com/energywebfoundation/origin/commit/b2d8ac0e70a298e790e9115a9dfddaa98921ec82))
* **exchange:** product service, more accounting, e2e tests ([43813a2](https://github.com/energywebfoundation/origin/commit/43813a27c72f34a129b87e2925eb0e4312f530da))
* **exchange:** transfer and account services ([1001b50](https://github.com/energywebfoundation/origin/commit/1001b509f55a70d89e5329aecfff97b3945e8c91))
* **exchange:** withdrawals ([d7be8b3](https://github.com/energywebfoundation/origin/commit/d7be8b3f27c8b3d0521a034a6591f013ffba5aee))





## [0.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/exchange@0.1.0...@energyweb/exchange@0.1.1) (2020-02-04)


### Bug Fixes

* **deps:** update nest monorepo to v6.11.5 ([0ddc961](https://github.com/energywebfoundation/origin/commit/0ddc9619933b5dd0585c4767b7229bf502e55ccf))





# 0.1.0 (2020-01-31)


### Features

* **exchange:** basics ([b47f14d](https://github.com/energywebfoundation/origin/commit/b47f14d2fc5046ee96b60a958c94f00f3a8a8c08))
* **exchange:** order book endpoint ([253d4ce](https://github.com/energywebfoundation/origin/commit/253d4ce842e5a634b7f977902dd580236b8d8bd0))
