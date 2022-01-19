# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.6.0...@energyweb/issuer-api@0.6.1) (2022-01-18)

**Note:** Version bump only for package @energyweb/issuer-api





# [0.6.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.4.0...@energyweb/issuer-api@0.6.0) (2021-12-30)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v1.0.2 ([8bf0044](https://github.com/energywebfoundation/origin/commit/8bf0044caab0b59fd6a7f1de6be03fd55c692f8d))
* **deps:** update dependency @nestjs/swagger to v5.1.4 ([6d704a5](https://github.com/energywebfoundation/origin/commit/6d704a56e59550e9076cbf42151045e29579ef88))
* **deps:** update dependency chai to v4.3.4 ([4cda837](https://github.com/energywebfoundation/origin/commit/4cda8376255385f0b8dddbfbbd4652ea36f43c83))
* **deps:** update dependency class-validator to v0.13.2 ([684367a](https://github.com/energywebfoundation/origin/commit/684367a560a8ef40fc7703aaae697c622ef2fbe6))
* **deps:** update dependency polly-js to v1.8.3 ([454be1d](https://github.com/energywebfoundation/origin/commit/454be1db7e1c1e62103855dbe1918ebacf981e4b))
* **deps:** update dependency swagger-ui-express to v4.2.0 ([aaf518c](https://github.com/energywebfoundation/origin/commit/aaf518c1093330af1c671022b2c0c01b0e809cc6))
* **deps:** update dependency typeorm to v0.2.39 ([f872cf4](https://github.com/energywebfoundation/origin/commit/f872cf445f18e8e9686b973dbf7c36e8f08cca17))
* **deps:** update dependency typeorm to v0.2.40 ([c13fb63](https://github.com/energywebfoundation/origin/commit/c13fb6371a005bed3c43771f073eda88020947cd))
* **deps:** update dependency typeorm to v0.2.41 ([ea80dda](https://github.com/energywebfoundation/origin/commit/ea80dda9f029703602a50c874992ca894edf3245))
* **issuer-api:** fix certificate created transaction ([1e483b5](https://github.com/energywebfoundation/origin/commit/1e483b5bcc28bb4713f1a2d5db8d2926d0cdaac5))
* **issuer-api:** fix get all certs query ([b0fd179](https://github.com/energywebfoundation/origin/commit/b0fd1797e4248ea90ac6f173d4362e168ee3f613))
* **issuer-api:** handle multiple certificates created at once ([4995022](https://github.com/energywebfoundation/origin/commit/499502247a36227f4fff26a52af5437213835baa))
* **issuer-api:** Only emit CertificateUpdated and Persisted events after changes are commited to db ([3a4aa0c](https://github.com/energywebfoundation/origin/commit/3a4aa0c3902c4f71cba3ced1d6f56a44d2236551))
* **issuer-api:** properly run all the tests ([3465373](https://github.com/energywebfoundation/origin/commit/3465373278570088942aaf3958d9ee5d137d930d))
* **issuer-api:** properly save metadata field ([5fa05df](https://github.com/energywebfoundation/origin/commit/5fa05df84a4130da2c200d993b943afecc98db0b))
* **issuer-api:** stabilize transaction-logs tests ([51c2be7](https://github.com/energywebfoundation/origin/commit/51c2be7703342a449969ee045c478813bb5aabd6))
* **issuer-api:** throw appropriate error for transactions on non-existing certificate ([41226da](https://github.com/energywebfoundation/origin/commit/41226da7d719a908e7a14403e740a063d74477d8))
* **issuer-api:** throw if tried to claim empty batch ([7ef12c2](https://github.com/energywebfoundation/origin/commit/7ef12c23b4a890851965b7975eb1083e7b04980b))
* **origin-backend:** updated typeorm and fixed issues with it ([171e7f4](https://github.com/energywebfoundation/origin/commit/171e7f48f374f74e3aec2d99d4d1762e3805d0f5))


### Features

* **exchange-irec:** Export from Exchange to I-REC ([09c0a7f](https://github.com/energywebfoundation/origin/commit/09c0a7f591d6ba47a7703b0cb4856f761ccd1269))
* **issuer-api:** allow to query certificates by more fields ([8d3a60b](https://github.com/energywebfoundation/origin/commit/8d3a60b22f2a968f5944797a845a9cdf4a645e66))
* **issuer-api:** allow to query certs by generationEnd frame ([2c22793](https://github.com/energywebfoundation/origin/commit/2c22793f366c68f47ef74efba1a095527c1edc72))
* **issuer-api:** Return transaction hashes for each blockchain interaction ([2bb6aa3](https://github.com/energywebfoundation/origin/commit/2bb6aa37bac23d30a4af496afc4309e9e25e03bf))


### BREAKING CHANGES

* **issuer-api:** The Issuer API no longer waits for the blockchain transactions to be mined, but returns a transaction hash to the user and delegates checking if the transaction has been mined to the API user





# [0.5.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.4.0...@energyweb/issuer-api@0.5.0) (2021-12-24)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v1.0.2 ([8bf0044](https://github.com/energywebfoundation/origin/commit/8bf0044caab0b59fd6a7f1de6be03fd55c692f8d))
* **deps:** update dependency @nestjs/swagger to v5.1.4 ([6d704a5](https://github.com/energywebfoundation/origin/commit/6d704a56e59550e9076cbf42151045e29579ef88))
* **deps:** update dependency chai to v4.3.4 ([4cda837](https://github.com/energywebfoundation/origin/commit/4cda8376255385f0b8dddbfbbd4652ea36f43c83))
* **deps:** update dependency class-validator to v0.13.2 ([684367a](https://github.com/energywebfoundation/origin/commit/684367a560a8ef40fc7703aaae697c622ef2fbe6))
* **deps:** update dependency swagger-ui-express to v4.2.0 ([aaf518c](https://github.com/energywebfoundation/origin/commit/aaf518c1093330af1c671022b2c0c01b0e809cc6))
* **deps:** update dependency typeorm to v0.2.39 ([f872cf4](https://github.com/energywebfoundation/origin/commit/f872cf445f18e8e9686b973dbf7c36e8f08cca17))
* **deps:** update dependency typeorm to v0.2.40 ([c13fb63](https://github.com/energywebfoundation/origin/commit/c13fb6371a005bed3c43771f073eda88020947cd))
* **deps:** update dependency typeorm to v0.2.41 ([ea80dda](https://github.com/energywebfoundation/origin/commit/ea80dda9f029703602a50c874992ca894edf3245))
* **issuer-api:** fix certificate created transaction ([1e483b5](https://github.com/energywebfoundation/origin/commit/1e483b5bcc28bb4713f1a2d5db8d2926d0cdaac5))
* **issuer-api:** fix get all certs query ([b0fd179](https://github.com/energywebfoundation/origin/commit/b0fd1797e4248ea90ac6f173d4362e168ee3f613))
* **issuer-api:** handle multiple certificates created at once ([4995022](https://github.com/energywebfoundation/origin/commit/499502247a36227f4fff26a52af5437213835baa))
* **issuer-api:** Only emit CertificateUpdated and Persisted events after changes are commited to db ([3a4aa0c](https://github.com/energywebfoundation/origin/commit/3a4aa0c3902c4f71cba3ced1d6f56a44d2236551))
* **issuer-api:** properly run all the tests ([3465373](https://github.com/energywebfoundation/origin/commit/3465373278570088942aaf3958d9ee5d137d930d))
* **issuer-api:** properly save metadata field ([5fa05df](https://github.com/energywebfoundation/origin/commit/5fa05df84a4130da2c200d993b943afecc98db0b))
* **issuer-api:** stabilize transaction-logs tests ([51c2be7](https://github.com/energywebfoundation/origin/commit/51c2be7703342a449969ee045c478813bb5aabd6))
* **issuer-api:** throw appropriate error for transactions on non-existing certificate ([41226da](https://github.com/energywebfoundation/origin/commit/41226da7d719a908e7a14403e740a063d74477d8))
* **issuer-api:** throw if tried to claim empty batch ([7ef12c2](https://github.com/energywebfoundation/origin/commit/7ef12c23b4a890851965b7975eb1083e7b04980b))
* **origin-backend:** updated typeorm and fixed issues with it ([171e7f4](https://github.com/energywebfoundation/origin/commit/171e7f48f374f74e3aec2d99d4d1762e3805d0f5))


### Features

* **exchange-irec:** Export from Exchange to I-REC ([09c0a7f](https://github.com/energywebfoundation/origin/commit/09c0a7f591d6ba47a7703b0cb4856f761ccd1269))
* **issuer-api:** allow to query certificates by more fields ([8d3a60b](https://github.com/energywebfoundation/origin/commit/8d3a60b22f2a968f5944797a845a9cdf4a645e66))
* **issuer-api:** allow to query certs by generationEnd frame ([2c22793](https://github.com/energywebfoundation/origin/commit/2c22793f366c68f47ef74efba1a095527c1edc72))
* **issuer-api:** Return transaction hashes for each blockchain interaction ([2bb6aa3](https://github.com/energywebfoundation/origin/commit/2bb6aa37bac23d30a4af496afc4309e9e25e03bf))


### BREAKING CHANGES

* **issuer-api:** The Issuer API no longer waits for the blockchain transactions to be mined, but returns a transaction hash to the user and delegates checking if the transaction has been mined to the API user





# [0.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.3.0...@energyweb/issuer-api@0.4.0) (2021-09-17)


### Bug Fixes

* **issuer-api:** remove ScheduleModule from IssuerModule ([8dce607](https://github.com/energywebfoundation/origin/commit/8dce60771f57c6edfc63d4e2ef0d219c26b3c87b))


### Features

* **issuer-api:** add enableCertificationRequest option ([ffb4fa7](https://github.com/energywebfoundation/origin/commit/ffb4fa7592ac05636ddda755f34f6e21f24e758f))
* **issuer-api:** add issuer module options ([1e55661](https://github.com/energywebfoundation/origin/commit/1e55661270fdeab001178c07ba0718bc3f1b44c6))
* **issuer-api:** add transaction log entity validation ([4832a74](https://github.com/energywebfoundation/origin/commit/4832a74e91ceb731d1b9281939516c500c864b6c))
* **issuer-api:** Allow to query for certificate with logs ([30ae58a](https://github.com/energywebfoundation/origin/commit/30ae58ab11950e773ba8fc9c9d6224e7643b727c))
* **issuer-api:** store event timestamp, add tests ([8b3e120](https://github.com/energywebfoundation/origin/commit/8b3e12050367348414dce865fcb48e1b9aeb85d0))
* **issuer-api:** track all transaction ([e4e0dd0](https://github.com/energywebfoundation/origin/commit/e4e0dd0fd3228aaf0fe1fe06a728dc457b162ac4))


### BREAKING CHANGES

* **issuer-api:** when used with certification request module, user need to include ScheduleModule.forRoot() by himself
* **issuer-api:** issuer-api AppModule was renamed to IssuerModule. Also, to use it, you need to call `IssuerModule.register()`





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer-api@0.2.0...@energyweb/issuer-api@0.3.0) (2021-08-30)


### Bug Fixes

* claim data number overflow ([d3b9f85](https://github.com/energywebfoundation/origin/commit/d3b9f857f3119dc89d8a915b6ee96b54137e980a))
* **deps:** update dependency @nestjs/config to v1 ([5226f56](https://github.com/energywebfoundation/origin/commit/5226f56898771fc093590bc0f337296496e945ba))
* **deps:** update dependency @nestjs/config to v1.0.1 ([3463c6f](https://github.com/energywebfoundation/origin/commit/3463c6f197398c159e88b078a9b8581c5f450429))
* **deps:** update dependency @nestjs/passport to v7.1.6 ([e6c99f4](https://github.com/energywebfoundation/origin/commit/e6c99f47c789a30ba3c73969854ebe956838b3be))
* **deps:** update dependency @nestjs/schedule to v1 ([2817ea0](https://github.com/energywebfoundation/origin/commit/2817ea077d2e2c9cd5eb96f5120c204e5b509cb6))
* **deps:** update dependency @nestjs/schedule to v1.0.1 ([43e71b4](https://github.com/energywebfoundation/origin/commit/43e71b464331fb32c38a0937c17aa297e6d4e363))
* **deps:** update dependency @nestjs/swagger to v4.8.1 ([daa023b](https://github.com/energywebfoundation/origin/commit/daa023bdcd20b78aa3dd8af966c8127b57b9d9ad))
* **deps:** update dependency @nestjs/swagger to v4.8.2 ([d17e433](https://github.com/energywebfoundation/origin/commit/d17e433f1fa2a07ea50bd26b423652670436c6ae))
* **deps:** update dependency ethers to v5.1.3 ([e7f4abb](https://github.com/energywebfoundation/origin/commit/e7f4abb8109303814e5727976732c528dcfa342d))
* **deps:** update dependency ethers to v5.1.4 ([71f379b](https://github.com/energywebfoundation/origin/commit/71f379b020e8e6bcd1b4b6f117d27e9babc6f93c))
* **deps:** update dependency pg to v8.6.0 ([5b16742](https://github.com/energywebfoundation/origin/commit/5b167423919ee4b238cb022c27a89a0d920f318b))
* **deps:** update dependency pg to v8.7.1 ([033293f](https://github.com/energywebfoundation/origin/commit/033293f0c203102f03b53fe50a519a60ebe170de))
* **deps:** update dependency polly-js to v1.8.2 ([af8a3db](https://github.com/energywebfoundation/origin/commit/af8a3dbb75977dadc182f2f2b3595d91766f967f))
* **deps:** update dependency rxjs to v6.6.7 ([5adc1e2](https://github.com/energywebfoundation/origin/commit/5adc1e219b360b4e3a28e037a1461f5719329cfd))
* **deps:** update dependency typeorm to v0.2.32 ([e2f606e](https://github.com/energywebfoundation/origin/commit/e2f606ee89aec9a5db84138b8df369a0561e08b1))
* **deps:** update dependency typeorm to v0.2.34 ([8c6f39c](https://github.com/energywebfoundation/origin/commit/8c6f39cffcce4cc3d6c3b65daa1a1a883e41aaac))
* **deps:** update ethers ([785e3ef](https://github.com/energywebfoundation/origin/commit/785e3efbe95fbde1984d80d8a50293d123364803))
* **deps:** update ethers ([d40f585](https://github.com/energywebfoundation/origin/commit/d40f585815ede90cc3ce1a901aa35bb3e9ebde3d))
* **deps:** update ethers to v5.3.0 ([72c970e](https://github.com/energywebfoundation/origin/commit/72c970e69d220250e7d9d3f36ac653a3610d6825))
* **deps:** update nest monorepo to v7.6.17 ([ecc84c0](https://github.com/energywebfoundation/origin/commit/ecc84c0ce3d2d2e47ebe7c667d53adbc6fdd9f6b))
* **deps:** update nest monorepo to v7.6.18 ([6835926](https://github.com/energywebfoundation/origin/commit/6835926dff7764d275b2006084e344c37948b7fa))
* Fix and improve the batch issuance API + add test ([37484e5](https://github.com/energywebfoundation/origin/commit/37484e58d0d3ac5b4d08612b81c320c70a4f4b49))
* **issuer-api:** fix comparing claim balances ([dfccdc7](https://github.com/energywebfoundation/origin/commit/dfccdc715bfe64ad9be3c639d422de0cb2aaf920))
* **issuer-api:** fix migrations for certificate and request IDs ([b44cb24](https://github.com/energywebfoundation/origin/commit/b44cb24291d5fe850d3c877e8e85bf93737648f1))
* **issuer-api:** Listening to wrong event for TransferBatch and ClaimBatch ([af7eb0d](https://github.com/energywebfoundation/origin/commit/af7eb0d8c77312daf4ff9624e6b54525f88f5c8a))
* **issuer-api:** Use getRepository when self-updating certificate ([bcc511a](https://github.com/energywebfoundation/origin/commit/bcc511a6dbbbe4813d6708259959ca4af94c90b0))
* revert ethers versions to working and disable updates ([49753f0](https://github.com/energywebfoundation/origin/commit/49753f0aed3f5e32e861b7bbe1d4a85bd900dce9))
* syncing a Certificate that was issued in a batch ([8665a4e](https://github.com/energywebfoundation/origin/commit/8665a4ef7a8d03388f4f6dd17c978298e5e54306))


### Features

* irec certificates handling ([fc0cb5e](https://github.com/energywebfoundation/origin/commit/fc0cb5e50c4acff4e16becf1d8d02ff628050c93))
* **issuer-api:** Batch transfer/claim to multiple destinations ([e3a3364](https://github.com/energywebfoundation/origin/commit/e3a33649667b30eda4e1321effee69c5a7ef46bd))
* **issuer-api:** filter certification requests by owner ([5f62ce9](https://github.com/energywebfoundation/origin/commit/5f62ce95f4ebc026f6840f567483821d838ffc3c))
* **issuer-api:** Full batch operations (issuance, transfer, claim) ([0f2064c](https://github.com/energywebfoundation/origin/commit/0f2064c3cfe328e9410c259a0946525e64570d3a))
* **issuer-api:** Separate Private Issuer contract + adjust to changes in Issuer and Registry smart contracts ([b1a4676](https://github.com/energywebfoundation/origin/commit/b1a4676ac6a34b5f6d156c4f9119d13003cc48a5))
* **issuer-irec-api:** import irec certificates ([30e6832](https://github.com/energywebfoundation/origin/commit/30e68323331021ce044c214ac2fde50669000f36))
* **issuer-irec-api:** import test update ([a5cbd09](https://github.com/energywebfoundation/origin/commit/a5cbd09baad7773747e9e29073bffaee433851b7))
* **issuer-irec-api:** list certificates ready to import ([bab0eb9](https://github.com/energywebfoundation/origin/commit/bab0eb954652c47bc101f71261bf0193f313e312))
* **origin-device-registry-irec-local-api:** added approve/reject actions to irec devices ([38c1943](https://github.com/energywebfoundation/origin/commit/38c1943ceb23753d724cc4673445db6c7dd04780))


### BREAKING CHANGES

* **issuer-api:** The batch transfer/claim API has changed
* **issuer-api:** Batch operations moved to /api/certificate-batch endpoint





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
