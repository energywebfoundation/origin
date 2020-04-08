# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.4.0...@energyweb/origin-ui-core@1.0.0) (2020-04-08)


### Bug Fixes

* **deps:** update dependency i18next to v19.3.4 ([61fd12f](https://github.com/energywebfoundation/origin/commit/61fd12f8f225f9f413c3906a4abe8ab2e2258901))
* **deps:** update dependency i18next-icu to v1.3.0 ([7adfe57](https://github.com/energywebfoundation/origin/commit/7adfe570c4b2f1e9742d1f8738ccd4255c20e1a4))
* **deps:** update react ([36a1dc2](https://github.com/energywebfoundation/origin/commit/36a1dc2a7d6ded84692c0f96fd2af45ec6b8f4ec))
* **deps:** update webpack ([7081f1d](https://github.com/energywebfoundation/origin/commit/7081f1dc27611653d3335a30b0821ec7f137b2d5))
* **origin-ui-core:** add spinner to exchange ui on posting bid ([5db4183](https://github.com/energywebfoundation/origin/commit/5db418329c2c9dedf08df0ecb475f0696b9e49a6))
* **origin-ui-core:** adjust exchange UI ([efe1e64](https://github.com/energywebfoundation/origin/commit/efe1e644852c227eb6a4987dbe40616bb504ee46))
* **origin-ui-core:** disallow requesting more than BigInt (1e16) energy ([11dfddd](https://github.com/energywebfoundation/origin/commit/11dfddde220946d33eb81a8c79707e13a5268a80))
* **origin-ui-core:** display notification when users tries to register device without organization ([ff4e0a4](https://github.com/energywebfoundation/origin/commit/ff4e0a44bc5c88f1028699872143a9a8e69c9163))
* **origin-ui-core:** fix displaying certificates ([aed5142](https://github.com/energywebfoundation/origin/commit/aed51423ec13d11800029ba736b44e1e7fb6a449))
* **origin-ui-core:** register device group ([555920e](https://github.com/energywebfoundation/origin/commit/555920e357ae6c29f1086e65f0680dba097e087e))
* **origin-ui-core:** update certificate energy in inbox after posting for sale ([1e15e3d](https://github.com/energywebfoundation/origin/commit/1e15e3de3dea7ec549c371a50406be6359e103b8))
* **origin-ui-core:** use user.id instead of user.blockchainAddress when getting MyDevices ([923fe0b](https://github.com/energywebfoundation/origin/commit/923fe0b85c94aa24fda5bdf03898437288901803))
* **origin-user-core:** don't show all devices to users without a blockchain address ([f5939ef](https://github.com/energywebfoundation/origin/commit/f5939ef965849255b9a848e7c9477bc20788dd6a))
* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* disallow bad user request certs flow ([99cec42](https://github.com/energywebfoundation/origin/commit/99cec42a5c813c8d4fb013ea8be1dce46ef1d20a))
* enable editing account settings ([b058828](https://github.com/energywebfoundation/origin/commit/b058828cafe8e07f0d5b921f8d0c59efc4f67ee7))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))
* working exchange integration ([49ced59](https://github.com/energywebfoundation/origin/commit/49ced5996c4198fcbf43b8e0eeaf978182ba3a47))


### Features

* **origin-ui-core:** add My trades view ([05ff2c9](https://github.com/energywebfoundation/origin/commit/05ff2c9a8056e31a0249ec9d881cbefc79cc887a))
* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* **origin-ui-core:** allow guests to view exchange ([a61e397](https://github.com/energywebfoundation/origin/commit/a61e39758b9426ee57c23f6cfe87752c72c8dfb8))
* add new exchange UI ([f0df25c](https://github.com/energywebfoundation/origin/commit/f0df25c9736b99713da1d4b7f53e73a8e7530b84))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* add posting certificates for sale ([84a141a](https://github.com/energywebfoundation/origin/commit/84a141a9868102f1d012170926c2439069716783))
* adjust the UI to the new structure ([4849fb2](https://github.com/energywebfoundation/origin/commit/4849fb2cc0913c927a437806503f3f5d9024e903))
* store energy amount in CertificationRequest ([5d756ba](https://github.com/energywebfoundation/origin/commit/5d756ba848245ebf50416d4ce53b61e8e0072ebb))


### BREAKING CHANGES

* Removed a lot of functionality





# [0.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.3.0...@energyweb/origin-ui-core@0.4.0) (2020-03-16)


### Bug Fixes

* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))
* **deps:** update dependency query-string to v6.11.1 ([a0e04e2](https://github.com/energywebfoundation/origin/commit/a0e04e2432447f3a4d71e47c05ae9b0734691e63))
* **deps:** update dependency yup to v0.28.3 ([a730750](https://github.com/energywebfoundation/origin/commit/a73075003e2bb0cc53544cbd93c40c9326d871de))


### Features

* add support for externalDeviceIds ([4db7361](https://github.com/energywebfoundation/origin/commit/4db7361131a84e67afa61f06ea3cafc6140c2a24))
* **origin-ui-core:** add market component ([f21611e](https://github.com/energywebfoundation/origin/commit/f21611e1a01105c5489535fb57d02552b2553c23))





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.2.1...@energyweb/origin-ui-core@0.3.0) (2020-03-02)


### Bug Fixes

* **deps:** update dependency clsx to v1.1.0 ([e730da2](https://github.com/energywebfoundation/origin/commit/e730da2c9b711f3bdcf5624eff04b9b6fa47ec19))
* **deps:** update dependency formik-material-ui to v1.0.2 ([1cd54fd](https://github.com/energywebfoundation/origin/commit/1cd54fd01146215098dcd8276e064fe8a4b473fb))
* **deps:** update dependency i18next to v19.3.2 ([034a38c](https://github.com/energywebfoundation/origin/commit/034a38cc9c261536a9af206530041f5d177e8b2e))
* **deps:** update dependency moment-timezone to v0.5.28 ([75cf848](https://github.com/energywebfoundation/origin/commit/75cf8483ad79f1f527120c0effcd869fa7c3be66))
* **deps:** update dependency query-string to v6.11.0 ([49ad031](https://github.com/energywebfoundation/origin/commit/49ad0315fcad03fc6a8fb2f24a27dce1ee35828a))
* **deps:** update dependency yup to v0.28.1 ([b89aeba](https://github.com/energywebfoundation/origin/commit/b89aebad0bbac537e49d3be8113a2a6108fae051))
* **deps:** update react ([6f4b7ea](https://github.com/energywebfoundation/origin/commit/6f4b7ead51b945c7a5a674002a77e45427ee7c3e))
* **deps:** update webpack ([0f87434](https://github.com/energywebfoundation/origin/commit/0f87434d299a961ed5970e9277e5ea4615fd5deb))


### Features

* **origin-ui-core:** Bids and Asks UI list component ([c08a03b](https://github.com/energywebfoundation/origin/commit/c08a03b911642644f5acb870305ed1efd35e9ce7))





## [0.2.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.2.0...@energyweb/origin-ui-core@0.2.1) (2020-02-17)


### Bug Fixes

* **origin-ui-core:** require device group capacity to be minimum 20 kw ([a75bd03](https://github.com/energywebfoundation/origin/commit/a75bd03078cdf545ed09993acf728201e2ca995d))





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.1.1...@energyweb/origin-ui-core@0.2.0) (2020-02-12)


### Features

* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





## [0.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.1.0...@energyweb/origin-ui-core@0.1.1) (2020-02-04)


### Bug Fixes

* **origin-ui-core:** fix preserving logged in user after refresh ([e03884a](https://github.com/energywebfoundation/origin/commit/e03884abafe319e5d5e35a6e385224466dde60c2))





# [0.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-core@0.0.2...@energyweb/origin-ui-core@0.1.0) (2020-01-31)


### Bug Fixes

* **deps:** update dependency @material-ui/pickers to v3.2.9 ([68192a5](https://github.com/energywebfoundation/origin/commit/68192a5f684bb91c97498f772bed7a2904447bfe))
* **deps:** update dependency axios to v0.19.1 ([40aa752](https://github.com/energywebfoundation/origin/commit/40aa7522c28cb2f6c32608669f154633be749649))
* **deps:** update dependency axios to v0.19.2 ([696eb46](https://github.com/energywebfoundation/origin/commit/696eb46fd2c7d26c223baaaf9f75d7943fc71517))
* **deps:** update dependency formik-material-ui to v1.0.1 ([3f41fc6](https://github.com/energywebfoundation/origin/commit/3f41fc678ff7ecffbaad278b73643361c37eb066))
* **deps:** update dependency query-string to v6.10.1 ([b2bd20e](https://github.com/energywebfoundation/origin/commit/b2bd20e0450f60d7d71a4ef623b3ab23dd1d7bc1))
* **deps:** update react ([5f9223d](https://github.com/energywebfoundation/origin/commit/5f9223d05d309fe6c1b1f291660b114f342a04c3))
* **origin-ui-core:** fix build process as a part of monorepo ([4ec9429](https://github.com/energywebfoundation/origin/commit/4ec9429a60e43d4360357dbd00d4bcef92b319ce))
* **origin-ui-core:** support configurable country ([0529f18](https://github.com/energywebfoundation/origin/commit/0529f18426c1924dfc4897268daa3ee59207c10d))


### Features

* add ability to add device group ([d01a9ed](https://github.com/energywebfoundation/origin/commit/d01a9ed1c7e474635f4ff342844fb94a8b4c3bc9))
* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
* implement UI for inviting user to organization ([0ddf0f0](https://github.com/energywebfoundation/origin/commit/0ddf0f07e51c4a3f551b797a8d49ff347fd6a8ad))





## 0.0.2 (2020-01-17)

**Note:** Version bump only for package @energyweb/origin-ui-core
