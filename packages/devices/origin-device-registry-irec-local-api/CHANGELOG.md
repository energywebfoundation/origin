# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-device-registry-irec-local-api@0.2.0...@energyweb/origin-device-registry-irec-local-api@0.3.0) (2021-08-30)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v1 ([5226f56](https://github.com/energywebfoundation/origin/commit/5226f56898771fc093590bc0f337296496e945ba))
* **deps:** update dependency @nestjs/config to v1.0.1 ([3463c6f](https://github.com/energywebfoundation/origin/commit/3463c6f197398c159e88b078a9b8581c5f450429))
* **deps:** update dependency @nestjs/passport to v7.1.6 ([e6c99f4](https://github.com/energywebfoundation/origin/commit/e6c99f47c789a30ba3c73969854ebe956838b3be))
* **deps:** update dependency @nestjs/schedule to v1 ([2817ea0](https://github.com/energywebfoundation/origin/commit/2817ea077d2e2c9cd5eb96f5120c204e5b509cb6))
* **deps:** update dependency @nestjs/schedule to v1.0.1 ([43e71b4](https://github.com/energywebfoundation/origin/commit/43e71b464331fb32c38a0937c17aa297e6d4e363))
* **deps:** update dependency @nestjs/swagger to v4.8.1 ([daa023b](https://github.com/energywebfoundation/origin/commit/daa023bdcd20b78aa3dd8af966c8127b57b9d9ad))
* **deps:** update dependency @nestjs/swagger to v4.8.2 ([d17e433](https://github.com/energywebfoundation/origin/commit/d17e433f1fa2a07ea50bd26b423652670436c6ae))
* **deps:** update dependency dotenv to v10 ([c1b44b7](https://github.com/energywebfoundation/origin/commit/c1b44b765b65c94129fb8be7131236de326fac45))
* **deps:** update dependency dotenv to v9 ([6b97197](https://github.com/energywebfoundation/origin/commit/6b971972a5633ba0417c746256d28b96e582028d))
* **deps:** update dependency dotenv to v9.0.2 ([711307a](https://github.com/energywebfoundation/origin/commit/711307a49b0a8a18879fcc80b6127708c2b0953d))
* **deps:** update dependency rxjs to v6.6.7 ([5adc1e2](https://github.com/energywebfoundation/origin/commit/5adc1e219b360b4e3a28e037a1461f5719329cfd))
* **deps:** update dependency typeorm to v0.2.32 ([e2f606e](https://github.com/energywebfoundation/origin/commit/e2f606ee89aec9a5db84138b8df369a0561e08b1))
* **deps:** update dependency typeorm to v0.2.34 ([8c6f39c](https://github.com/energywebfoundation/origin/commit/8c6f39cffcce4cc3d6c3b65daa1a1a883e41aaac))
* **deps:** update nest monorepo to v7.6.17 ([ecc84c0](https://github.com/energywebfoundation/origin/commit/ecc84c0ce3d2d2e47ebe7c667d53adbc6fdd9f6b))
* **deps:** update nest monorepo to v7.6.18 ([6835926](https://github.com/energywebfoundation/origin/commit/6835926dff7764d275b2006084e344c37948b7fa))
* **issuer-irec-api-wrapper:** hopefully fixed irec auth token refresh ([d05441a](https://github.com/energywebfoundation/origin/commit/d05441aaf83506dd3859e12ae955346fd113beb2))
* **issuer-irec-api:** several fixes ([0b71973](https://github.com/energywebfoundation/origin/commit/0b7197317be96dbc21c57ef555793b19e60eef05))
* **origin-device-registry-irec-local-api:** cast WH to MWH for IREC device creation ([311081b](https://github.com/energywebfoundation/origin/commit/311081ba538e84dc397446c38e3b077b9c009fe4))
* **origin-device-registry-irec-local-api:** cast WH to MWH for IREC device creation ([f1b1870](https://github.com/energywebfoundation/origin/commit/f1b18707b7d6e79fe1e5cebc74e892038c8cd5b7))
* **origin-device-registry-irec-local-api:** fixed irec device approval ([b9855bd](https://github.com/energywebfoundation/origin/commit/b9855bd235d73b2e036975ea944e46969c85ac4c))
* **origin-device-registry-irec-local-api:** invalid merge ([dcafff2](https://github.com/energywebfoundation/origin/commit/dcafff2d0b8344f921b926c4016b5776ed4005e3))
* revert ethers versions to working and disable updates ([49753f0](https://github.com/energywebfoundation/origin/commit/49753f0aed3f5e32e861b7bbe1d4a85bd900dce9))


### Features

* irec certificates handling ([fc0cb5e](https://github.com/energywebfoundation/origin/commit/fc0cb5e50c4acff4e16becf1d8d02ff628050c93))
* **origin-device-registry-irec-local-api:** added approve/reject actions to irec devices ([38c1943](https://github.com/energywebfoundation/origin/commit/38c1943ceb23753d724cc4673445db6c7dd04780))
* **origin-device-registry-irec-local-api:** added approve/reject endpoint ([eaa6e96](https://github.com/energywebfoundation/origin/commit/eaa6e9692dd88e9cb926c6986216301407ef8e7d))
* **origin-device-registry-irec-local-api:** added postalCode, country, region, subregion fields to irec devices ([1ab76ce](https://github.com/energywebfoundation/origin/commit/1ab76ce67d2292532dc997cc680c7812c18e1b06))
* **origin-device-registry-irec-local-api:** approve/reject tests ([002d92e](https://github.com/energywebfoundation/origin/commit/002d92e8d4bf0ca099e8ec4bf8e8d8884c645f2e))
* **origin-device-registry-irec-local-api:** cron jobs refactoring ([a73fcd2](https://github.com/energywebfoundation/origin/commit/a73fcd269aea2569e369f6955eea65c82ef58943))
* **origin-device-registry-irec-local-api:** default account for irec device creation is platform acc now ([956424d](https://github.com/energywebfoundation/origin/commit/956424deb7168514a064803887e24d6042dbc89a))
* **origin-device-registry-irec-local-api:** irec fuel now is fuelType, updated devices controller ([c9f1427](https://github.com/energywebfoundation/origin/commit/c9f1427ee760a21da14ab73da40c2de2c64c5a70))
* **origin-device-registry-irec-local-api:** irec service refactoring ([19b0e61](https://github.com/energywebfoundation/origin/commit/19b0e6182dc07da07dc37b03d7683236a4a9ab6f))
* **origin-device-registry-irec-local-api:** irec service refactoring, mock service separated ([ca1d53c](https://github.com/energywebfoundation/origin/commit/ca1d53c81f28ac6db3d3e778bf89e66517e68fd2))
* **origin-device-registry-irec-local-api:** removed duplicate country field ([b78b5d6](https://github.com/energywebfoundation/origin/commit/b78b5d60e813edc0dd596f900e48683141c91537))
* **origin-organization-irec-api:** added access token apply method ([3b857dd](https://github.com/energywebfoundation/origin/commit/3b857ddfdb31e7b009950af3121d3b8141fcc204))
* **origin-organization-irec-api:** updated get connection endpoint, now does not return connection credentials ([19c4874](https://github.com/energywebfoundation/origin/commit/19c48740c6fbd8cf2fc65f632d3269c07cc5cf16))
* **origin-ui-irec-core:** get devices to import ([3d03739](https://github.com/energywebfoundation/origin/commit/3d0373965167208dd3d09125ebd88bd57c1bf364))





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-device-registry-irec-local-api@0.1.0...@energyweb/origin-device-registry-irec-local-api@0.2.0) (2021-03-23)


### Bug Fixes

* **deps:** update dependency @nestjs/swagger to v4.7.13 ([eba5075](https://github.com/energywebfoundation/origin/commit/eba5075f1578f2ae9d382cc4a955487eaa50d3bb))
* **deps:** update dependency @nestjs/swagger to v4.7.15 ([d58375c](https://github.com/energywebfoundation/origin/commit/d58375c74ffc3de71381e7bab7d65b5040340f6d))
* **deps:** update dependency @nestjs/swagger to v4.7.16 ([c240c31](https://github.com/energywebfoundation/origin/commit/c240c31cba4af09d322426ef09e80e89ea561f5d))
* **deps:** update dependency @nestjs/swagger to v4.8.0 ([f3baec9](https://github.com/energywebfoundation/origin/commit/f3baec98c786542549f87b0d5f2e8c3d425ea638))
* **deps:** update dependency rxjs to v6.6.6 ([8cbb567](https://github.com/energywebfoundation/origin/commit/8cbb567986449af7be85aab7fde3ea0eff6d3490))
* **deps:** update dependency typeorm to v0.2.31 ([b2d4b30](https://github.com/energywebfoundation/origin/commit/b2d4b30d90985597a1b55fb25860b5259769cffc))
* **deps:** update nest monorepo to v7.6.12 ([bacde48](https://github.com/energywebfoundation/origin/commit/bacde48160b73749f5e476b73bbafcef55902aba))
* **deps:** update nest monorepo to v7.6.14 ([9b0ca43](https://github.com/energywebfoundation/origin/commit/9b0ca4312c548681e752ba0e49d0a5a03350ae2e))
* **origin-device-irec-local-api:** correct types in response ([b2e1bef](https://github.com/energywebfoundation/origin/commit/b2e1bef45a2bea9192c45aafdc196a0dc92d5d89))


### Features

* **origin-backend-irec-app:** added irec integration to device creation ([38a0cf3](https://github.com/energywebfoundation/origin/commit/38a0cf36741503f08fec58a795fcf1d3f985b0d8))
* **origin-backend-irec-app:** added mapping from device/fuel type codes to names ([213cf08](https://github.com/energywebfoundation/origin/commit/213cf083be0317795a299c6e492962573a13bba7))
* **origin-device-registry-irec-local-api:** added device and fuels types validation ([d047fd2](https://github.com/energywebfoundation/origin/commit/d047fd21c2ba3fe9559d8fc88e8992f6705ff83e))
* **origin-device-registry-irec-local-api:** added get devices to import endpount ([5ec98ff](https://github.com/energywebfoundation/origin/commit/5ec98ffb3676524b74f1a608c66accc15a21c833))
* **origin-device-registry-irec-local-api:** added validate device ownership hander ([eb35e11](https://github.com/energywebfoundation/origin/commit/eb35e1103048bbca16414a5ad8a62c0f8c9baa10))
* **origin-device-registry-local-api:** made irec integration optional ([7880424](https://github.com/energywebfoundation/origin/commit/78804244f4917cd9dd0bcadb5e7d36a6cb17ae6e))





# 0.1.0 (2021-02-12)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v0.6.3 ([4991dfb](https://github.com/energywebfoundation/origin/commit/4991dfb918ce7efb6d0a8bd72a011c825b3aec46))
* **deps:** update nest monorepo to v7.6.11 ([daee156](https://github.com/energywebfoundation/origin/commit/daee156b9c315c527311f0c78ffbdf4226b6785a))


### Features

* **origin-device-registry-irec-local-api:** add endpoints to get device and fuel types ([6ff6b7f](https://github.com/energywebfoundation/origin/commit/6ff6b7fb15d7813140ea701846736a1f779ba788))
* **origin-device-registry-irec-local-api:** added GET /irec/device-registry/device-type and GET /irec/device-registry/fuel-type ([a06029e](https://github.com/energywebfoundation/origin/commit/a06029e493cadf8fc5b64accc21cddd6ffc798a3))
