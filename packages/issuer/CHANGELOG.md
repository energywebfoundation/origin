# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
