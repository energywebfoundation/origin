# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@3.0.0...@energyweb/issuer@3.0.1) (2020-11-30)

**Note:** Version bump only for package @energyweb/issuer





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.6...@energyweb/issuer@3.0.0) (2020-11-20)


### Bug Fixes

* **deps:** update dependency ethers to v5.0.15 ([7205cfd](https://github.com/energywebfoundation/origin/commit/7205cfd3b823730beed77fa8195b7c9c06898a88))
* **deps:** update dependency mocha to v8.2.0 ([e318650](https://github.com/energywebfoundation/origin/commit/e3186509c94beee909dd349147ad8d3c320dc1cf))
* **deps:** update dependency mocha to v8.2.1 ([eb0c31b](https://github.com/energywebfoundation/origin/commit/eb0c31bb1fc4671815523628bac3fa60a6a6166c))
* **issuer:** security bug where a user could force another user to claim its certificates ([e9d742b](https://github.com/energywebfoundation/origin/commit/e9d742b1f1cbc09469f86b2e9ca929dc78eec572))


### chore

* **issuer:** replace Configuration with BlockchainProperties + remove dependency on origin-backend ([52409c3](https://github.com/energywebfoundation/origin/commit/52409c3f89ebdb00962a28c2075da85d45689fd2))


### BREAKING CHANGES

* **issuer:** The Certificate and CertificationRequest facades no linger rely on the Configuration object, but BlockchainProperties. Also removed the dependency on origin-backend





## [2.4.6](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.5...@energyweb/issuer@2.4.6) (2020-10-02)


### Bug Fixes

* **deps:** update dependency mocha to v8.1.3 ([83b5450](https://github.com/energywebfoundation/origin/commit/83b54506cb8e9fd2a08fe88436956df144e1f565))





## [2.4.5](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.4...@energyweb/issuer@2.4.5) (2020-08-25)

**Note:** Version bump only for package @energyweb/issuer





## [2.4.4](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.3...@energyweb/issuer@2.4.4) (2020-08-12)

**Note:** Version bump only for package @energyweb/issuer





## [2.4.3](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.2...@energyweb/issuer@2.4.3) (2020-08-10)


### Bug Fixes

* **deps:** update dependency ethers to v5.0.8 ([c69bde0](https://github.com/energywebfoundation/origin/commit/c69bde05c4f0eba5dbc49833f266af24c84c0187))
* **deps:** update dependency mocha to v8.1.1 ([f27c8a5](https://github.com/energywebfoundation/origin/commit/f27c8a591702ade55b2311f89c485a63050bbe2e))





## [2.4.2](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.1...@energyweb/issuer@2.4.2) (2020-08-06)


### Bug Fixes

* **deps:** update dependency mocha to v8.1.0 ([fa63959](https://github.com/energywebfoundation/origin/commit/fa63959e14b1426108eaf9142a341e6f387ca204))
* **issuer:** Certificate creation date always shows current time ([fc1cb51](https://github.com/energywebfoundation/origin/commit/fc1cb518906b0e5be12d5fefa315cb2b4696f749))





## [2.4.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.4.0...@energyweb/issuer@2.4.1) (2020-07-16)

**Note:** Version bump only for package @energyweb/issuer





# [2.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.3.1...@energyweb/issuer@2.4.0) (2020-07-08)


### Bug Fixes

* **deps:** update dependency winston to v3.3.0 ([12f111e](https://github.com/energywebfoundation/origin/commit/12f111ed16274e40d9ccbb4c3d6f9d8d222cb2fe))
* **deps:** update dependency winston to v3.3.3 ([d66ad8e](https://github.com/energywebfoundation/origin/commit/d66ad8e4f8f65a8c6bed6ec95303a175771ed230))


### Features

* **issuer:** approvedDate and revokedDate added to ICertificationRequest ([20b276b](https://github.com/energywebfoundation/origin/commit/20b276b8eab5731517798eda2213e48df17636d6))





## [2.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.3.0...@energyweb/issuer@2.3.1) (2020-06-16)

**Note:** Version bump only for package @energyweb/issuer





# [2.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.2.0...@energyweb/issuer@2.3.0) (2020-06-16)


### Bug Fixes

* **deps:** update dependency mocha to v8 ([11aa19a](https://github.com/energywebfoundation/origin/commit/11aa19ac0cdc0ef3038358972e3bc574891e22dc))
* **issuer:** fix a bug with certificate showing an incorrect partial claim value ([5c0547c](https://github.com/energywebfoundation/origin/commit/5c0547c125c479f5262681e005ce96b6e0d7acf9))


### Features

* more efficient certification request validation ([2d85e0e](https://github.com/energywebfoundation/origin/commit/2d85e0e6a8888244a701e92905bf90e46852f5c9))
* **issuer:** getAllOwnedCertificates ([e5b2fbb](https://github.com/energywebfoundation/origin/commit/e5b2fbbc286bbc936f81e35087bdc3c69abd0a38))
* **origin-ui-core:** add deposit action ([07acf6e](https://github.com/energywebfoundation/origin/commit/07acf6e17d8df816671438d26dd90cf5f9532445))





# [2.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.1.0...@energyweb/issuer@2.2.0) (2020-05-29)


### Bug Fixes

* **deps:** update dependency mocha to v7.2.0 ([b0ee1b6](https://github.com/energywebfoundation/origin/commit/b0ee1b6300808e1bdb465f7e0459f6c11b5be2b9))
* certificate tests ([923eb7e](https://github.com/energywebfoundation/origin/commit/923eb7e2f17c9d882077a2810d738c703946aeba))
* linting errors ([c6a6c65](https://github.com/energywebfoundation/origin/commit/c6a6c6519441582b397616b40bbe9b72cb550c98))
* ownership commitments permissions + store original requestor ([1751d30](https://github.com/energywebfoundation/origin/commit/1751d3009d11f92d23bc9834632ef5b0ffb5bcee))


### Features

* **issuer:** store sender for the certification request ([39d0871](https://github.com/energywebfoundation/origin/commit/39d0871b3ccc48719d3ca3dc7539c86593fffba6))





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@2.0.0...@energyweb/issuer@2.1.0) (2020-05-15)


### Bug Fixes

* **issuer:** enable storing more than 32 bytes in beneficiary data ([f075dfd](https://github.com/energywebfoundation/origin/commit/f075dfd048761443093b026d3f5c185a175d352b))


### Features

* **issuer:** store all certificationRequest information on the backend ([355e51f](https://github.com/energywebfoundation/origin/commit/355e51ff00db1321283b11d1f7188304abe56fb0))
* **issuer:** Use defined beneficiary claim data ([e89900f](https://github.com/energywebfoundation/origin/commit/e89900f20f76167480a2b317d0f85320d8e370e2))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@1.1.0...@energyweb/issuer@2.0.0) (2020-04-24)


### Bug Fixes

* certificate history ([74e4e37](https://github.com/energywebfoundation/origin/commit/74e4e376fcb96bfa1844bf56d565e7c39af6612e))
* **issuer:** contract interactions wait ([15f2785](https://github.com/energywebfoundation/origin/commit/15f2785c8b30e23d2883024719fea7fabe37d44e))
* **issuer:** return initialized=false if fetching events errored on Certificate ([80087b2](https://github.com/energywebfoundation/origin/commit/80087b27c289087129a9d9778e1b1c51f18d0970))
* **issuer:** return uninitialized certification request if fails to read data from backend ([0c19601](https://github.com/energywebfoundation/origin/commit/0c196019b4a3203e4b61180d8028f9c5da753e08))
* **issuer:** storing bignumber in precise proofs ([6dd91c7](https://github.com/energywebfoundation/origin/commit/6dd91c707656108f0882450af3a3dd38d95adc0c))
* **issuer:** swtich IDs to get correct certificationRequestId in Certificate ([23d5527](https://github.com/energywebfoundation/origin/commit/23d5527daf1525e380bdc8b6a767a03f773a1338))
* **issuer:** wait for confirmation before proceeding to the next transcation ([cba2368](https://github.com/energywebfoundation/origin/commit/cba23684ac4158f22cd7192a1aa16d0d1c8515b8))


### chore

* **issuer:** better code organization and naming ([438aa89](https://github.com/energywebfoundation/origin/commit/438aa89279d68a33dea752fc00b0c6f41b84a268))
* **issuer:** only show energy volumes for the active user ([39cf708](https://github.com/energywebfoundation/origin/commit/39cf708d8b02e8859b6ec48babbadfcffc53c32b))


### Features

* **issuer:** Web3js to ethers + typechain ([594ea82](https://github.com/energywebfoundation/origin/commit/594ea82067ec7cab73b7c3a8315814ac5f68d663))


### BREAKING CHANGES

* **issuer:** Certificate.energy now returns "publicVolume", "privateVolume" and "claimedVolume"
* **issuer:** Use Certificate and CertificationRequest instead of Certificate.Entity and CertificationRequest.Entity
* **issuer:** The issuer package now uses the Ethers instead of Web3JS





# [1.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@1.0.1...@energyweb/issuer@1.1.0) (2020-04-08)


### Bug Fixes

* **issuer:** return empty array in getCertificationRequestsForDevice() if none ([fe51d90](https://github.com/energywebfoundation/origin/commit/fe51d90366c0a4e507710e006eead14d93d6354c))
* disallow bad user request certs flow ([99cec42](https://github.com/energywebfoundation/origin/commit/99cec42a5c813c8d4fb013ea8be1dce46ef1d20a))
* **issuer:** Certificate always has a private and public volume balance ([37274aa](https://github.com/energywebfoundation/origin/commit/37274aaeb9d881e8759c2121d3c9b80cbda586dd))
* **issuer:** isCertificatePrivate check ([52c7001](https://github.com/energywebfoundation/origin/commit/52c70016305c01cfa0f9038d2e3d7d3178d8ee83))


### Features

* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* add posting certificates for sale ([84a141a](https://github.com/energywebfoundation/origin/commit/84a141a9868102f1d012170926c2439069716783))
* **issuer:** approval process for private transfers ([b285bfd](https://github.com/energywebfoundation/origin/commit/b285bfdc4c7807a619ded163cc49a83b7545eb88))
* **issuer:** improve storing multi-owner commitments off-chain ([4c03539](https://github.com/energywebfoundation/origin/commit/4c035393eaadf0db394c6d690c8f49837acdca20))
* **issuer:** multi-owner private certificates ([e3c23cf](https://github.com/energywebfoundation/origin/commit/e3c23cf48d5acd1b0c68aa88d79fabf499b89b48))
* store energy amount in CertificationRequest ([5d756ba](https://github.com/energywebfoundation/origin/commit/5d756ba848245ebf50416d4ce53b61e8e0072ebb))
* **issuer:** rename IssueRequest to CertificationRequest, various security fixes ([0984142](https://github.com/energywebfoundation/origin/commit/098414200b68ffbe545ae33129aef11f7cb93692))





## [1.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@1.0.0...@energyweb/issuer@1.0.1) (2020-03-16)

**Note:** Version bump only for package @energyweb/issuer





# [1.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@0.12.0...@energyweb/issuer@1.0.0) (2020-03-02)


### Features

* **issuer:** Unified private and public issuer contract ([72de487](https://github.com/energywebfoundation/origin/commit/72de4877c87de16c44f883561406237a96d60d39))


### BREAKING CHANGES

* **issuer:** Unified issuer





# [0.12.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@0.11.0...@energyweb/issuer@0.12.0) (2020-02-17)


### Features

* **issuer:** export registry contract build ([fba7d26](https://github.com/energywebfoundation/origin/commit/fba7d26bc291cc538b2408996e192d198e120fac))





# [0.11.0](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@0.10.1...@energyweb/issuer@0.11.0) (2020-02-12)


### Bug Fixes

* **issuer:** check time periods before requesting issuance ([14b4451](https://github.com/energywebfoundation/origin/commit/14b44513c8b194c92e2445cb64bd1e69ab880e9d))
* **issuer:** set certificate topic in the constructor ([bac288c](https://github.com/energywebfoundation/origin/commit/bac288ca878131e07497392ffed432b672afac30))


### Features

* check generation period when issuing ([e51dc8b](https://github.com/energywebfoundation/origin/commit/e51dc8b245a4ec26f52a85cef18721ee659bbf3d))
* **issuer:** customizable certificate topic + AbstractIssuer contract ([c519906](https://github.com/energywebfoundation/origin/commit/c5199066cb654244e6bae7ebcebfbe2123aa2d1b))
* check balances of other users ([2d4af2b](https://github.com/energywebfoundation/origin/commit/2d4af2bb508490e1fbe15361386b37d37fb23a15))
* **issuer:** fetchin registry addresses ([fc4dc2f](https://github.com/energywebfoundation/origin/commit/fc4dc2f485463dad14499f422ef8062b0acb94eb))
* Unprivatize @energyweb/issuer ([79404e9](https://github.com/energywebfoundation/origin/commit/79404e90ea370faf8fae9abc58737bfa8fccf16c))





## [0.10.1](https://github.com/energywebfoundation/origin/compare/@energyweb/issuer@0.10.0...@energyweb/issuer@0.10.1) (2020-02-04)

**Note:** Version bump only for package @energyweb/issuer





# 0.10.0 (2020-01-31)


### Bug Fixes

* **issuer:** batch claiming and batch transferring ([0e0c9a8](https://github.com/energywebfoundation/origin/commit/0e0c9a8e444e57af1e1bc54abe35c422131384e2))
* **issuer:** deployment to Volta ([0c47042](https://github.com/energywebfoundation/origin/commit/0c4704249a090c7d47a420462247ae80c8cdedc4))
* **issuer:** rm unused dependecies ([8177302](https://github.com/energywebfoundation/origin/commit/81773020264aaa4731f553fe61f875b6e95d769a))


### Features

* **issuer:** add JS wrappers for PublicIssuer and Certificate ([6511677](https://github.com/energywebfoundation/origin/commit/6511677012aaa8ec8239fa951f6311811bf030a2))
* **issuer:** enable revoking a certificate ([bb3b2a6](https://github.com/energywebfoundation/origin/commit/bb3b2a6d913662b589a4f30f94b8ec5c6a6b1cd5))
* **issuer:** implement validity data checks ([800f102](https://github.com/energywebfoundation/origin/commit/800f102327ecd82aced430c5e99cad1c6c920ec2))
* **issuer:** initial skeleton for private issuance ([37098f7](https://github.com/energywebfoundation/origin/commit/37098f7a2cc5593166ae1dd8afc21adc9335a9af))
