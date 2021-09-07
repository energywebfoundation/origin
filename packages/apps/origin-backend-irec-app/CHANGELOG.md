# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-irec-app@1.1.0...@energyweb/origin-backend-irec-app@1.2.0) (2021-08-30)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v1 ([5226f56](https://github.com/energywebfoundation/origin/commit/5226f56898771fc093590bc0f337296496e945ba))
* **deps:** update dependency @nestjs/config to v1.0.1 ([3463c6f](https://github.com/energywebfoundation/origin/commit/3463c6f197398c159e88b078a9b8581c5f450429))
* **deps:** update dependency @nestjs/passport to v7.1.6 ([e6c99f4](https://github.com/energywebfoundation/origin/commit/e6c99f47c789a30ba3c73969854ebe956838b3be))
* **deps:** update dependency @nestjs/schedule to v1 ([2817ea0](https://github.com/energywebfoundation/origin/commit/2817ea077d2e2c9cd5eb96f5120c204e5b509cb6))
* **deps:** update dependency @nestjs/schedule to v1.0.1 ([43e71b4](https://github.com/energywebfoundation/origin/commit/43e71b464331fb32c38a0937c17aa297e6d4e363))
* **deps:** update dependency @nestjs/swagger to v4.8.1 ([daa023b](https://github.com/energywebfoundation/origin/commit/daa023bdcd20b78aa3dd8af966c8127b57b9d9ad))
* **deps:** update dependency @nestjs/swagger to v4.8.2 ([d17e433](https://github.com/energywebfoundation/origin/commit/d17e433f1fa2a07ea50bd26b423652670436c6ae))
* **deps:** update dependency typeorm to v0.2.32 ([e2f606e](https://github.com/energywebfoundation/origin/commit/e2f606ee89aec9a5db84138b8df369a0561e08b1))
* **deps:** update dependency typeorm to v0.2.34 ([8c6f39c](https://github.com/energywebfoundation/origin/commit/8c6f39cffcce4cc3d6c3b65daa1a1a883e41aaac))
* **deps:** update nest monorepo to v7.6.17 ([ecc84c0](https://github.com/energywebfoundation/origin/commit/ecc84c0ce3d2d2e47ebe7c667d53adbc6fdd9f6b))
* **deps:** update nest monorepo to v7.6.18 ([6835926](https://github.com/energywebfoundation/origin/commit/6835926dff7764d275b2006084e344c37948b7fa))
* **issuer-irec-api:** several fixes ([0b71973](https://github.com/energywebfoundation/origin/commit/0b7197317be96dbc21c57ef555793b19e60eef05))
* **origin-backend-irec-app:** fix an issue with detecting device/fuel type on the exchange ([3e1c0aa](https://github.com/energywebfoundation/origin/commit/3e1c0aa376526b7e13c63965800a4df7ca994312))
* paths to main.js ([72b40e6](https://github.com/energywebfoundation/origin/commit/72b40e655043ffd8cfad42f5feb97721f98bd8eb))


### Features

* irec certificates handling ([fc0cb5e](https://github.com/energywebfoundation/origin/commit/fc0cb5e50c4acff4e16becf1d8d02ff628050c93))
* **issuer-irec-api:** import irec certificates ([30e6832](https://github.com/energywebfoundation/origin/commit/30e68323331021ce044c214ac2fde50669000f36))
* **origin-backend-irec-app:** added integration with issuer-irec-api package ([048b4be](https://github.com/energywebfoundation/origin/commit/048b4be1375d416b6bee60f02dbe0661be5ca5c5))
* **origin-device-registry-irec-local-api:** added approve/reject actions to irec devices ([38c1943](https://github.com/energywebfoundation/origin/commit/38c1943ceb23753d724cc4673445db6c7dd04780))
* **origin-device-registry-irec-local-api:** cron jobs refactoring ([a73fcd2](https://github.com/energywebfoundation/origin/commit/a73fcd269aea2569e369f6955eea65c82ef58943))
* **origin-device-registry-irec-local-api:** irec service refactoring, mock service separated ([ca1d53c](https://github.com/energywebfoundation/origin/commit/ca1d53c81f28ac6db3d3e778bf89e66517e68fd2))
* **origin-organization-irec-api:** added beneficiary creation on org creation ([309c43a](https://github.com/energywebfoundation/origin/commit/309c43acca868157a0aad7885d3b01942b86a383))
* **origin-organization-irec-api:** added beneficiary module with cqrs handlers ([2379ab1](https://github.com/energywebfoundation/origin/commit/2379ab104e1588a5ec71b4e7f6f91b40cefcaac5))
* **origin-organization-irec-api:** added create local beneficiary endpoint and changed list beneficiaries endpoint ([7f2a75e](https://github.com/energywebfoundation/origin/commit/7f2a75e596e5f5c55b350cb53e225e4cdfbd6691))
* **origin-organization-irec-api:** added userName to connection ([bc5eb6d](https://github.com/energywebfoundation/origin/commit/bc5eb6df464baeaa6ff50948ce8e29ffe577ef17))
* **origin-organization-irec-api:** beneficiary API ([4f6c0db](https://github.com/energywebfoundation/origin/commit/4f6c0dbf8e6466467c9c1dcb379c3b3ab934ed3f))
* **origin-organization-irec-api:** import certificates fix ([e3e33ff](https://github.com/energywebfoundation/origin/commit/e3e33ff49b09f615dc5eef623f4c184c24ce45f5))
* **origin-organization-irec-api:** rewrote beneficiaries creation ([038d79e](https://github.com/energywebfoundation/origin/commit/038d79ee458c7fba2b893180c4598fb0bb82fe36))
* **origin-organization-irec-api:** updated get connection endpoint, now does not return connection credentials ([19c4874](https://github.com/energywebfoundation/origin/commit/19c48740c6fbd8cf2fc65f632d3269c07cc5cf16))
* **origin-ui-irec-core:** device import ui ([1dfd423](https://github.com/energywebfoundation/origin/commit/1dfd423fe914016c74564b99482f64481f935167))
* **origin-ui-irec-core:** proper devices listing ([2962389](https://github.com/energywebfoundation/origin/commit/29623892033de40da0ba6714aa0804428d653468))





# [1.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-irec-app@1.0.1...@energyweb/origin-backend-irec-app@1.1.0) (2021-03-23)


### Bug Fixes

* **deps:** update dependency @nestjs-modules/mailer to v1.5.1 ([ed17e71](https://github.com/energywebfoundation/origin/commit/ed17e718349b840e0257b773d30c93be24cc0ea2))
* **deps:** update dependency @nestjs/schedule to v0.4.3 ([c3ade3b](https://github.com/energywebfoundation/origin/commit/c3ade3bf14d6b73dedc9c836f80d058b86e4246b))
* **deps:** update dependency @nestjs/swagger to v4.7.13 ([eba5075](https://github.com/energywebfoundation/origin/commit/eba5075f1578f2ae9d382cc4a955487eaa50d3bb))
* **deps:** update dependency @nestjs/swagger to v4.7.15 ([d58375c](https://github.com/energywebfoundation/origin/commit/d58375c74ffc3de71381e7bab7d65b5040340f6d))
* **deps:** update dependency @nestjs/swagger to v4.7.16 ([c240c31](https://github.com/energywebfoundation/origin/commit/c240c31cba4af09d322426ef09e80e89ea561f5d))
* **deps:** update dependency @nestjs/swagger to v4.8.0 ([f3baec9](https://github.com/energywebfoundation/origin/commit/f3baec98c786542549f87b0d5f2e8c3d425ea638))
* **deps:** update dependency typeorm to v0.2.31 ([b2d4b30](https://github.com/energywebfoundation/origin/commit/b2d4b30d90985597a1b55fb25860b5259769cffc))
* **deps:** update nest monorepo to v7.6.12 ([bacde48](https://github.com/energywebfoundation/origin/commit/bacde48160b73749f5e476b73bbafcef55902aba))
* **deps:** update nest monorepo to v7.6.14 ([9b0ca43](https://github.com/energywebfoundation/origin/commit/9b0ca4312c548681e752ba0e49d0a5a03350ae2e))
* **origin-backend-irec-app:** added dependencies ([f3697c8](https://github.com/energywebfoundation/origin/commit/f3697c89bfd2e24a8537e3b20a63a5dee7a44f25))
* **origin-backend-irec-app:** handlebars adapter import ([1bbd06e](https://github.com/energywebfoundation/origin/commit/1bbd06e633d2c87f517f02b3ddbd9d5648ab2d27))
* **origin-backend-irec-app:** use migrations-irec instead of migrations ([bc738a9](https://github.com/energywebfoundation/origin/commit/bc738a9e251405c74d3e1097b3870c21a111ff38))


### Features

* **migrations-irec:** use names instead of codes ([ea8830b](https://github.com/energywebfoundation/origin/commit/ea8830bdf0cf9e313b24fb12c0a1d6887b52695b))
* **origin-backend-irec-app:** added irec integration to device creation ([38a0cf3](https://github.com/energywebfoundation/origin/commit/38a0cf36741503f08fec58a795fcf1d3f985b0d8))
* **origin-backend-irec-app:** added mapping from device/fuel type codes to names ([213cf08](https://github.com/energywebfoundation/origin/commit/213cf083be0317795a299c6e492962573a13bba7))
* **origin-backend-irec-app:** email on irec device rejection ([b6b16a9](https://github.com/energywebfoundation/origin/commit/b6b16a914b93e5f9c2997b9af24774d910151799))
* **origin-device-registry-local-api:** made irec integration optional ([7880424](https://github.com/energywebfoundation/origin/commit/78804244f4917cd9dd0bcadb5e7d36a6cb17ae6e))





## 1.0.1 (2021-02-12)

**Note:** Version bump only for package @energyweb/origin-backend-irec-app
