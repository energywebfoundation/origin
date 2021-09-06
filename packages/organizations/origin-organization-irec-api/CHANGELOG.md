# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.5.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.4.0...@energyweb/origin-organization-irec-api@1.5.0) (2021-08-30)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v1 ([5226f56](https://github.com/energywebfoundation/origin/commit/5226f56898771fc093590bc0f337296496e945ba))
* **deps:** update dependency @nestjs/config to v1.0.1 ([3463c6f](https://github.com/energywebfoundation/origin/commit/3463c6f197398c159e88b078a9b8581c5f450429))
* **deps:** update dependency @nestjs/passport to v7.1.6 ([e6c99f4](https://github.com/energywebfoundation/origin/commit/e6c99f47c789a30ba3c73969854ebe956838b3be))
* **deps:** update dependency @nestjs/schedule to v1 ([2817ea0](https://github.com/energywebfoundation/origin/commit/2817ea077d2e2c9cd5eb96f5120c204e5b509cb6))
* **deps:** update dependency @nestjs/schedule to v1.0.1 ([43e71b4](https://github.com/energywebfoundation/origin/commit/43e71b464331fb32c38a0937c17aa297e6d4e363))
* **deps:** update dependency @nestjs/swagger to v4.8.1 ([daa023b](https://github.com/energywebfoundation/origin/commit/daa023bdcd20b78aa3dd8af966c8127b57b9d9ad))
* **deps:** update dependency @nestjs/swagger to v4.8.2 ([d17e433](https://github.com/energywebfoundation/origin/commit/d17e433f1fa2a07ea50bd26b423652670436c6ae))
* **deps:** update dependency rxjs to v6.6.7 ([5adc1e2](https://github.com/energywebfoundation/origin/commit/5adc1e219b360b4e3a28e037a1461f5719329cfd))
* **deps:** update dependency typeorm to v0.2.32 ([e2f606e](https://github.com/energywebfoundation/origin/commit/e2f606ee89aec9a5db84138b8df369a0561e08b1))
* **deps:** update dependency typeorm to v0.2.34 ([8c6f39c](https://github.com/energywebfoundation/origin/commit/8c6f39cffcce4cc3d6c3b65daa1a1a883e41aaac))
* **deps:** update nest monorepo to v7.6.17 ([ecc84c0](https://github.com/energywebfoundation/origin/commit/ecc84c0ce3d2d2e47ebe7c667d53adbc6fdd9f6b))
* **deps:** update nest monorepo to v7.6.18 ([6835926](https://github.com/energywebfoundation/origin/commit/6835926dff7764d275b2006084e344c37948b7fa))
* **issuer-irec-api-wrapper:** changed constructor signature to run onTokensRefreshed handler synchronously ([a3ef564](https://github.com/energywebfoundation/origin/commit/a3ef5644d425c460765bb07c360b507bdb850aad))
* **issuer-irec-api-wrapper:** hopefully fixed irec auth token refresh ([d05441a](https://github.com/energywebfoundation/origin/commit/d05441aaf83506dd3859e12ae955346fd113beb2))
* **issuer-irec-api:** fix check certification request state task ([9c601b8](https://github.com/energywebfoundation/origin/commit/9c601b8b8a589713317e5663c38696d1cdcf54c4))
* **issuer-irec-api:** several fixes ([0b71973](https://github.com/energywebfoundation/origin/commit/0b7197317be96dbc21c57ef555793b19e60eef05))
* **origin-device-registry-irec-local-api:** cast WH to MWH for IREC device creation ([311081b](https://github.com/energywebfoundation/origin/commit/311081ba538e84dc397446c38e3b077b9c009fe4))
* **origin-device-registry-irec-local-api:** fixed tokens refresh ([299280d](https://github.com/energywebfoundation/origin/commit/299280da4b31782bd7649430f3ccba72cb74d5c8))
* revert ethers versions to working and disable updates ([49753f0](https://github.com/energywebfoundation/origin/commit/49753f0aed3f5e32e861b7bbe1d4a85bd900dce9))


### Features

* irec certificates handling ([fc0cb5e](https://github.com/energywebfoundation/origin/commit/fc0cb5e50c4acff4e16becf1d8d02ff628050c93))
* **irec-issuer-api:** added irec certificate dto ([92f2dcd](https://github.com/energywebfoundation/origin/commit/92f2dcd133c094f2440b06b426fb679cd192acd7))
* **irec-issuer-api:** added irec certificate dto ([2bfa9f7](https://github.com/energywebfoundation/origin/commit/2bfa9f759fca55fd9a1c0851a13091c0f850fff7))
* **issuer-irec-api:** added irec certificate transfer ([9bdb3c4](https://github.com/energywebfoundation/origin/commit/9bdb3c4d98b6fd3822bc5fb6ddcc287f7c81723b))
* **issuer-irec-api:** added revoke handler and cron ([a42e9f9](https://github.com/energywebfoundation/origin/commit/a42e9f90d3c4f481001cf026487d48cbf6ec1c77))
* **issuer-irec-api:** import irec certificates ([30e6832](https://github.com/energywebfoundation/origin/commit/30e68323331021ce044c214ac2fde50669000f36))
* **issuer-irec-api:** import test update ([a5cbd09](https://github.com/energywebfoundation/origin/commit/a5cbd09baad7773747e9e29073bffaee433851b7))
* **issuer-irec-api:** list certificates ready to import ([bab0eb9](https://github.com/energywebfoundation/origin/commit/bab0eb954652c47bc101f71261bf0193f313e312))
* **origin-device-registry-irec-local-api:** added approve/reject actions to irec devices ([38c1943](https://github.com/energywebfoundation/origin/commit/38c1943ceb23753d724cc4673445db6c7dd04780))
* **origin-device-registry-irec-local-api:** added approve/reject endpoint ([eaa6e96](https://github.com/energywebfoundation/origin/commit/eaa6e9692dd88e9cb926c6986216301407ef8e7d))
* **origin-device-registry-irec-local-api:** cron jobs refactoring ([a73fcd2](https://github.com/energywebfoundation/origin/commit/a73fcd269aea2569e369f6955eea65c82ef58943))
* **origin-device-registry-irec-local-api:** default account for irec device creation is platform acc now ([956424d](https://github.com/energywebfoundation/origin/commit/956424deb7168514a064803887e24d6042dbc89a))
* **origin-device-registry-irec-local-api:** irec service refactoring ([19b0e61](https://github.com/energywebfoundation/origin/commit/19b0e6182dc07da07dc37b03d7683236a4a9ab6f))
* **origin-device-registry-irec-local-api:** irec service refactoring, mock service separated ([ca1d53c](https://github.com/energywebfoundation/origin/commit/ca1d53c81f28ac6db3d3e778bf89e66517e68fd2))
* **origin-organization-irec-api:** Add redeem function to IREC service ([67bfd1b](https://github.com/energywebfoundation/origin/commit/67bfd1b4b472a05a5583982d72fbe187295279b1))
* **origin-organization-irec-api:** added access token apply method ([3b857dd](https://github.com/energywebfoundation/origin/commit/3b857ddfdb31e7b009950af3121d3b8141fcc204))
* **origin-organization-irec-api:** added active/attempts fields to connection entity ([4ef6dff](https://github.com/energywebfoundation/origin/commit/4ef6dffb5ef1273bcfcb891511c7bf0fd4037e02))
* **origin-organization-irec-api:** added beneficiaries controller ([92d85be](https://github.com/energywebfoundation/origin/commit/92d85bee9269f2c97e6a2f793277968afe10002c))
* **origin-organization-irec-api:** added beneficiaries controller ([a114f1f](https://github.com/energywebfoundation/origin/commit/a114f1f12d845d30370a68ef49f240247797b0c1))
* **origin-organization-irec-api:** added beneficiaries migration ([2578bb5](https://github.com/energywebfoundation/origin/commit/2578bb5c559d8954fc07b8044bd4e1ede515f3f5))
* **origin-organization-irec-api:** added beneficiary creation on org creation ([309c43a](https://github.com/energywebfoundation/origin/commit/309c43acca868157a0aad7885d3b01942b86a383))
* **origin-organization-irec-api:** added beneficiary creation on org creation ([5d2719c](https://github.com/energywebfoundation/origin/commit/5d2719c4eea8e0b0f36100700c87b042f6a055c0))
* **origin-organization-irec-api:** added beneficiary module with cqrs handlers ([2379ab1](https://github.com/energywebfoundation/origin/commit/2379ab104e1588a5ec71b4e7f6f91b40cefcaac5))
* **origin-organization-irec-api:** added create local beneficiary endpoint and changed list beneficiaries endpoint ([7f2a75e](https://github.com/energywebfoundation/origin/commit/7f2a75e596e5f5c55b350cb53e225e4cdfbd6691))
* **origin-organization-irec-api:** added irec module to organization package ([e72cdd2](https://github.com/energywebfoundation/origin/commit/e72cdd2ec0f4c4a0ef175b1bf09b4bb757bf52cb))
* **origin-organization-irec-api:** added userName to connection ([bc5eb6d](https://github.com/energywebfoundation/origin/commit/bc5eb6df464baeaa6ff50948ce8e29ffe577ef17))
* **origin-organization-irec-api:** beneficiary API ([4f6c0db](https://github.com/energywebfoundation/origin/commit/4f6c0dbf8e6466467c9c1dcb379c3b3ab934ed3f))
* **origin-organization-irec-api:** fixed build ([6c946dd](https://github.com/energywebfoundation/origin/commit/6c946dd889f63864e7c76ff0088eeabec9813950))
* **origin-organization-irec-api:** list certificates test fix ([797f4d7](https://github.com/energywebfoundation/origin/commit/797f4d70026baaf5ce98db2126f026c2c0e2a55b))
* **origin-organization-irec-api:** rewrote beneficiaries creation ([038d79e](https://github.com/energywebfoundation/origin/commit/038d79ee458c7fba2b893180c4598fb0bb82fe36))
* **origin-organization-irec-api:** use irec module in connection module ([a74f2bc](https://github.com/energywebfoundation/origin/commit/a74f2bc294965a1d408d46a3e58bab1b845dfc95))
* **origin-organization-irec-api:** user can recreate irec connection now ([143a6ba](https://github.com/energywebfoundation/origin/commit/143a6ba87b7fe575e9d804b99657c46c788b5840))





# [1.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.3.0...@energyweb/origin-organization-irec-api@1.4.0) (2021-03-23)


### Bug Fixes

* **deps:** update dependency @nestjs/swagger to v4.7.13 ([eba5075](https://github.com/energywebfoundation/origin/commit/eba5075f1578f2ae9d382cc4a955487eaa50d3bb))
* **deps:** update dependency @nestjs/swagger to v4.7.15 ([d58375c](https://github.com/energywebfoundation/origin/commit/d58375c74ffc3de71381e7bab7d65b5040340f6d))
* **deps:** update dependency @nestjs/swagger to v4.7.16 ([c240c31](https://github.com/energywebfoundation/origin/commit/c240c31cba4af09d322426ef09e80e89ea561f5d))
* **deps:** update dependency @nestjs/swagger to v4.8.0 ([f3baec9](https://github.com/energywebfoundation/origin/commit/f3baec98c786542549f87b0d5f2e8c3d425ea638))
* **deps:** update dependency rxjs to v6.6.6 ([8cbb567](https://github.com/energywebfoundation/origin/commit/8cbb567986449af7be85aab7fde3ea0eff6d3490))
* **deps:** update dependency typeorm to v0.2.31 ([b2d4b30](https://github.com/energywebfoundation/origin/commit/b2d4b30d90985597a1b55fb25860b5259769cffc))
* **deps:** update nest monorepo to v7.6.12 ([bacde48](https://github.com/energywebfoundation/origin/commit/bacde48160b73749f5e476b73bbafcef55902aba))
* **deps:** update nest monorepo to v7.6.14 ([9b0ca43](https://github.com/energywebfoundation/origin/commit/9b0ca4312c548681e752ba0e49d0a5a03350ae2e))


### Features

* **origin-backend-irec-app:** added irec integration to device creation ([38a0cf3](https://github.com/energywebfoundation/origin/commit/38a0cf36741503f08fec58a795fcf1d3f985b0d8))
* **origin-device-registry-local-api:** made irec integration optional ([7880424](https://github.com/energywebfoundation/origin/commit/78804244f4917cd9dd0bcadb5e7d36a6cb17ae6e))





# [1.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.2.1...@energyweb/origin-organization-irec-api@1.3.0) (2021-02-12)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v0.6.3 ([4991dfb](https://github.com/energywebfoundation/origin/commit/4991dfb918ce7efb6d0a8bd72a011c825b3aec46))
* **deps:** update nest monorepo to v7.6.11 ([daee156](https://github.com/energywebfoundation/origin/commit/daee156b9c315c527311f0c78ffbdf4226b6785a))
* **origin-organization-irec-api:** fix get connection endpoint ([14ad8b8](https://github.com/energywebfoundation/origin/commit/14ad8b8ee9d2215d349f48cecb4cf6912234b041))


### Features

* **origin-irec-organization-api:** added connection as a service, updated tests ([c48e607](https://github.com/energywebfoundation/origin/commit/c48e6073afcaa8677df50d58cc14c6320f456b51))
* **origin-irec-organization-api:** added connection module ([09da211](https://github.com/energywebfoundation/origin/commit/09da2113acfb27d95dc442aadee6be2f36e257c8))





## [1.2.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.2.0...@energyweb/origin-organization-irec-api@1.2.1) (2020-12-04)

**Note:** Version bump only for package @energyweb/origin-organization-irec-api





# [1.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.1.1...@energyweb/origin-organization-irec-api@1.2.0) (2020-11-30)


### Bug Fixes

* add a body definition to all missing @Body() in requests ([6afc5a5](https://github.com/energywebfoundation/origin/commit/6afc5a5b8eb02d9be21035b34431d88d690bcda4))


### Features

* **origin-organisation-irec-api:** added contact details fields ([b0bb283](https://github.com/energywebfoundation/origin/commit/b0bb2839b3da5d4ed684293c8aed262c8221d67a))
* **origin-organisation-irec-api:** added db migration ([17f971f](https://github.com/energywebfoundation/origin/commit/17f971f6c0aeed29c4a4fe740e2c644fbd353de7))
* **origin-organisation-irec-api:** updated new-registration.dto.ts ([1fdebaf](https://github.com/energywebfoundation/origin/commit/1fdebafb0e42ec777ed145d4eb38fc0efa034a52))
* **origin-organization-irec-api-client:** create an autogenerated client for origin-organization-irec-api ([7737b5c](https://github.com/energywebfoundation/origin/commit/7737b5cadb1ab2e1e0d27de72aeccabc95b59755))





## [1.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-organization-irec-api@1.1.0...@energyweb/origin-organization-irec-api@1.1.1) (2020-11-20)


### Bug Fixes

* **deps:** update dependency typeorm to v0.2.28 ([8e9a26c](https://github.com/energywebfoundation/origin/commit/8e9a26c3a9c6218ad12fcd6c8ce6b71f767c8731))
* **deps:** update dependency typeorm to v0.2.29 ([49232fb](https://github.com/energywebfoundation/origin/commit/49232fbd085e86a5e1df943aa917fe5ed86bff27))
* **deps:** update nest monorepo to v7.5.2 ([adf4996](https://github.com/energywebfoundation/origin/commit/adf49962f675ef88237af96baef0093057d0697f))





# 1.1.0 (2020-10-02)


### Bug Fixes

* **deps:** update dependency @nestjs/typeorm to v7.1.4 ([f0f39d4](https://github.com/energywebfoundation/origin/commit/f0f39d40dfde6c0d079575de7af4d4aed0e8f160))
* **origin-organizatin-irec-api:** opt-in use of pipes and interceptors ([5a8b407](https://github.com/energywebfoundation/origin/commit/5a8b407a9bb8e832d0078656e839f5f618c8895b))


### Features

* **origin-organization-irec-api:** add both type ([3f4c6e8](https://github.com/energywebfoundation/origin/commit/3f4c6e84df7eb6d1f0ab14273296f29cd939b349))
* **origin-organization-irec-api:** extended I-REC registration form ([b965253](https://github.com/energywebfoundation/origin/commit/b965253a9bc6ec578f19b0b7a48db224949e02b0))
* **origin-organization-irec-api:** registration created event ([726a4f8](https://github.com/energywebfoundation/origin/commit/726a4f83c1f4e637a1501d1a2a0a7eedcad83c17))
