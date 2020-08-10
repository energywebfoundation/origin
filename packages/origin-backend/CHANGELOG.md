# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@6.3.0...@energyweb/origin-backend@7.0.0) (2020-08-10)


### Bug Fixes

* **deps:** update dependency ethers to v5.0.8 ([c69bde0](https://github.com/energywebfoundation/origin/commit/c69bde05c4f0eba5dbc49833f266af24c84c0187))
* **origin-backend:** allow non-active user to register organization ([b3475a9](https://github.com/energywebfoundation/origin/commit/b3475a99fd33cd610db4d857c8d0a02f5c1945a5))
* **origin-backend:** only active organization can register devices ([b7a1c92](https://github.com/energywebfoundation/origin/commit/b7a1c923d780ecc08ecdbe47ac7fe4fbb5497821))


### chore

* **origin-backend:** replace IUserWithRelationIds with IUser ([c2f2f8e](https://github.com/energywebfoundation/origin/commit/c2f2f8e314a2268014b3beb0658490870b281bb6))


### BREAKING CHANGES

* **origin-backend:** findOne returns user with full organization object





# [6.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@6.2.0...@energyweb/origin-backend@6.3.0) (2020-08-06)


### Bug Fixes

* **deps:** update dependency class-transformer to v0.3.1 ([e827bbb](https://github.com/energywebfoundation/origin/commit/e827bbbc6f357c135d2d803bb82ad8774914913a))
* **deps:** update dependency rxjs to v6.6.2 ([1849e03](https://github.com/energywebfoundation/origin/commit/1849e030c7cce6bf4d4063f3c6d96d98fbb96041))
* **deps:** update dependency uuid to v8.3.0 ([f672f9f](https://github.com/energywebfoundation/origin/commit/f672f9f20647a6a1f373b7688736b69c3ed3b27e))
* **deps:** update nest monorepo to v7.4.2 ([241f045](https://github.com/energywebfoundation/origin/commit/241f04525f8d09f8bd464f979933390ad6a4bb2a))
* **origin-ui-core:** allow unregistered user get and put intvitaion ([bb35fb3](https://github.com/energywebfoundation/origin/commit/bb35fb312355f9a100fcd9156e81d040e2f4b997))
* **origin-ui-core:** fix ui test ([2e1b9c2](https://github.com/energywebfoundation/origin/commit/2e1b9c28ce6447406cb43d54f9d76ab8c2f9c102))
* **origin-ui-core:** store org id for non-admin and non-support agent ([7498fb4](https://github.com/energywebfoundation/origin/commit/7498fb49c9e24856c2a8d4c8c0b57b2ca8d8923b))


### Features

* **origin-backend:** getAll Devices with relations ([b644f38](https://github.com/energywebfoundation/origin/commit/b644f38b6b6a3b7cff7039795df31d25553455fc))
* **origin-backend:** optional loadRelationsId of device ([ee38568](https://github.com/energywebfoundation/origin/commit/ee385688431b72dcc967544e1552e59e6ca8c9ef))
* **origin-backend:** retypify DeviceService.findOne ([ee78b2c](https://github.com/energywebfoundation/origin/commit/ee78b2cd51f075e50e5a45b9d4a21d3c259d5941))





# [6.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@6.1.0...@energyweb/origin-backend@6.2.0) (2020-07-16)


### Bug Fixes

* **deps:** update dependency @nestjs/jwt to v7.1.0 ([3b8864d](https://github.com/energywebfoundation/origin/commit/3b8864de4850b15418b85e950734a0e8e5152062))
* **deps:** update nest monorepo to v7.3.2 ([875bb1b](https://github.com/energywebfoundation/origin/commit/875bb1b17fee5647d921f6771a58a4aa55aec59d))
* **origin-backend:** fix permissions for getting Organizations ([6bee114](https://github.com/energywebfoundation/origin/commit/6bee11405fa7d7a5b7d9172fb853ab1b23351ae0))


### Features

* **origin-backend:** Confirmation Emails - auto-sending emails and confirmation endpoints ([0a33d1b](https://github.com/energywebfoundation/origin/commit/0a33d1bfd24cb3e44c3e2fc304b56e57735f513d))





# [6.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@6.0.1...@energyweb/origin-backend@6.1.0) (2020-07-08)


### Bug Fixes

* **deps:** update dependency @nestjs/passport to v7.1.0 ([2ca9c9f](https://github.com/energywebfoundation/origin/commit/2ca9c9f57cd34871ce061f0fca2f873bf17d9e99))
* **deps:** update dependency rxjs to v6.6.0 ([851151d](https://github.com/energywebfoundation/origin/commit/851151dd110a2b11fc9b491e491c4a152aaac807))
* **deps:** update dependency uuid to v8.2.0 ([20ea72e](https://github.com/energywebfoundation/origin/commit/20ea72e92f79b2d919364093a127d0a15ce15040))
* **deps:** update nest monorepo to v7.3.1 ([a7777b8](https://github.com/energywebfoundation/origin/commit/a7777b85aa0c56df661b1b3f24467cc8e95b2051))
* **exchange:** revert fix ([b31a318](https://github.com/energywebfoundation/origin/commit/b31a318216fe6a4d4d7c373b3eb4a2219c6d946b))
* **origin-backend:** change user status to active ([6ba9c20](https://github.com/energywebfoundation/origin/commit/6ba9c209694ae58ce493d286cec39bd58e49e821))
* **origin-backend:** only allow certain users to get user information ([4a07737](https://github.com/energywebfoundation/origin/commit/4a077376a9c98537cf6adafcd855bf185bb5eba8))
* **origin-backend:** permissioned smart meter reading PUT ([54db1ab](https://github.com/energywebfoundation/origin/commit/54db1ab389433179025e697740432a56ecc3bf3e))
* **origin-backend:** remove active user check on user/me ([764e3e8](https://github.com/energywebfoundation/origin/commit/764e3e811d97b3db842e79294dc2c055a5eb09ce))
* **origin-backend:** remove ActiveUserGuard on user/me ([219a211](https://github.com/energywebfoundation/origin/commit/219a211790bd710124dcdc1eae5884d1d0806bb1))


### Features

* **origin-backend:** approvedDate and revokedDate added to ICertificationRequest ([b4ebd19](https://github.com/energywebfoundation/origin/commit/b4ebd194266c1ab78ff48ada3347bcc514498b1b))
* **origin-backend:** CertificationRequest approved and revoked events ([3777847](https://github.com/energywebfoundation/origin/commit/3777847412f9ca88b4510f24d9d79ee708767efb))





## [6.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@6.0.0...@energyweb/origin-backend@6.0.1) (2020-06-16)

**Note:** Version bump only for package @energyweb/origin-backend





# [6.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@5.1.1...@energyweb/origin-backend@6.0.0) (2020-06-16)


### Bug Fixes

* **origin-backend:** explicit update ([338f65f](https://github.com/energywebfoundation/origin/commit/338f65fcce40c6392ce3f1519d2581dd4070f343))
* **origin-backend:** fix updating device ([0e0654c](https://github.com/energywebfoundation/origin/commit/0e0654c90eff09d1e9465959ed399013283bad18))
* Certification request validation handling ([5e0f90b](https://github.com/energywebfoundation/origin/commit/5e0f90bc2abfa2a8e26db19739f283d4eaf4c926))
* **deps:** update dependency @nestjs/typeorm to v7.1.0 ([960d52b](https://github.com/energywebfoundation/origin/commit/960d52b0dde4709bf6da1dcf4e317f445a6c76be))
* **deps:** update dependency typeorm to v0.2.25 ([d1ce442](https://github.com/energywebfoundation/origin/commit/d1ce4428931bdfede4d73d7016fcb1cb8d564a7d))
* **origin-backend:** combine notNull default ([d57a048](https://github.com/energywebfoundation/origin/commit/d57a048cfc7539fa956239486c00a55723787ccc))
* **origin-backend:** make certification request energy not nullable ([dfb8320](https://github.com/energywebfoundation/origin/commit/dfb8320a90c73b7e49e93ed04b7c434abe33cefe))
* **origin-backend:** make files not nullable and default to [] ([62100e1](https://github.com/energywebfoundation/origin/commit/62100e11c24da8351632ad4fcd0b45c2637dad05))
* **origin-backend:** make sure files are stored as [] ([cc0b799](https://github.com/energywebfoundation/origin/commit/cc0b79911467261eba12206122bf33b976533fac))
* **origin-backend:** syntax nto null and default ([be8486d](https://github.com/energywebfoundation/origin/commit/be8486d81c73df981eeead020a29a9ce5e15bce1))
* implement a certification request data queue ([78cbd4a](https://github.com/energywebfoundation/origin/commit/78cbd4a7a36959cbb0820cf17dc277f0bf5ae823))


### chore

* remove unused Lead User references ([aaae5df](https://github.com/energywebfoundation/origin/commit/aaae5df4b0abd1b69924981eb2dc8b7e5df31e63))


### Features

* Updating organization user roles ([c1096f2](https://github.com/energywebfoundation/origin/commit/c1096f28c1b48e606d5deeda7f33720613764326))


### BREAKING CHANGES

* Lead user is no longer needed to create an organization





## [5.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@5.1.0...@energyweb/origin-backend@5.1.1) (2020-05-29)


### Bug Fixes

* **origin-backend:** proper auth for getting organization invitations ([4d9d5c0](https://github.com/energywebfoundation/origin/commit/4d9d5c0cc8cdfa476e0138eeef6e6ee2c7889fdd))
* change URL to fetch invitations for organization ([cc0b238](https://github.com/energywebfoundation/origin/commit/cc0b238966cf8e6e3b14b485f2d4e4b6e7cec865))
* endpoint for fetching invitations for an organization ([57e11d9](https://github.com/energywebfoundation/origin/commit/57e11d9c8b09739ff443389c71dae6c31e4bb6d3))
* **deps:** update dependency @nestjs/config to v0.5.0 ([e57cb73](https://github.com/energywebfoundation/origin/commit/e57cb73efa867020dcd4414a0ad4694995a42a80))
* **deps:** update dependency uuid to v8 ([2342cae](https://github.com/energywebfoundation/origin/commit/2342cae4dc0c3e86e86ac4237f48f2d62943ca28))
* **deps:** update dependency uuid to v8.1.0 ([2bcb626](https://github.com/energywebfoundation/origin/commit/2bcb626b42bcb726041dfe6ddc79bd5f73bd2060))
* **deps:** update nest monorepo to v7.0.13 ([ea1133d](https://github.com/energywebfoundation/origin/commit/ea1133dd1efdcad9083b19b622884918dd802bee))
* **deps:** update nest monorepo to v7.1.0 ([78be769](https://github.com/energywebfoundation/origin/commit/78be769e5b1f8a27e16bb65ff2c879b20a03bce8))
* **origin-backend:** additional types casting ([573b27e](https://github.com/energywebfoundation/origin/commit/573b27e225b1592cf8e2093e852b76351c00d3a5))
* **origin-backend:** allow other users to access minimal certification request data ([8d310b7](https://github.com/energywebfoundation/origin/commit/8d310b7cef51596397014a3cf87d832224727132))
* **origin-backend:** deny creating certification requests for non-approved devices ([d8d1756](https://github.com/energywebfoundation/origin/commit/d8d175605f21fd3aac8f6e05556371ec104fa93a))
* certificate tests ([923eb7e](https://github.com/energywebfoundation/origin/commit/923eb7e2f17c9d882077a2810d738c703946aeba))
* ownership commitments permissions + store original requestor ([1751d30](https://github.com/energywebfoundation/origin/commit/1751d3009d11f92d23bc9834632ef5b0ffb5bcee))





# [5.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@5.0.1...@energyweb/origin-backend@5.1.0) (2020-05-15)


### Bug Fixes

* fixate tslib version to 1.11.2 to avoid typeorm issue ([274d4e9](https://github.com/energywebfoundation/origin/commit/274d4e9717f4c8f4b258a56331724330dcc3685b))
* store [] as the default for device.files ([52e5fcc](https://github.com/energywebfoundation/origin/commit/52e5fccdeb303133b3db9413fc317e4a1c60ebca))
* **origin-backend:** add default to status and kycstatus for user ([afc397f](https://github.com/energywebfoundation/origin/commit/afc397f37441af389666b865c088927cf0c22444))
* **origin-backend:** add files default ([f7a265b](https://github.com/energywebfoundation/origin/commit/f7a265bd268201289d93788d310131ebc2ea56e9))
* **origin-backend:** add nullable:false to user statuses ([090e29b](https://github.com/energywebfoundation/origin/commit/090e29b6791b47b20a702bd0f4120236b59a83b1))
* **origin-backend:** apply ownership to certificate requests ([75408ea](https://github.com/energywebfoundation/origin/commit/75408ead45f0bf508c742975528787efa20b8db7))
* **origin-backend:** configuration not being initialized in the tests ([2bff1f0](https://github.com/energywebfoundation/origin/commit/2bff1f087d353fbdfabb9022fccf2b07c12f105c))
* **origin-backend:** don't run watcher service if the Issuer address is incorrect ([278bcca](https://github.com/energywebfoundation/origin/commit/278bcca8e1bd4cb27e60f9a02351ac430e00df90))
* **origin-backend:** fix e2e test checking if certified ([b319b2c](https://github.com/energywebfoundation/origin/commit/b319b2cbba8f4cccd4f2d4154a4cbd13bfe7e099))
* **origin-backend:** fix getting certification request ([f1d766f](https://github.com/energywebfoundation/origin/commit/f1d766f0fea9e38b8fd869904818f82b09817a15))
* **origin-backend:** fix issues with registering/approving devices ([9a5e066](https://github.com/energywebfoundation/origin/commit/9a5e066298d5c949f840dc09b8b098b6ce31e50c))
* **origin-backend:** migration dropping column ([00220b8](https://github.com/energywebfoundation/origin/commit/00220b800a8e5353aea4d6de1709c8e8a20e4d30))
* **origin-backend:** smReads - calculating if certified or not ([2a9a01e](https://github.com/energywebfoundation/origin/commit/2a9a01e4d09a8a683214630dac1214c426f4f67d))


### Features

* add meterStats to Device for un/certified meter readings reference ([627d785](https://github.com/energywebfoundation/origin/commit/627d7855506f52cb70ee083844ef2664b9227a0b))
* Detect and store the whole CertificationRequest on the backend ([613eb28](https://github.com/energywebfoundation/origin/commit/613eb28eeae25ec414b393f61311dbfb679351d4))
* register Approved and Revoked events ([e74afec](https://github.com/energywebfoundation/origin/commit/e74afec51924a37abe39cad94e416f955474f17b))
* **origin-backend:** added automatic post for sale flag, API for updating settings ([a871f60](https://github.com/energywebfoundation/origin/commit/a871f601ea611ca5e51fbe7cd0d0b0fcf4d2cea3))
* **origin-backend:** price per device asset. initial e2e setup ([8479b5e](https://github.com/energywebfoundation/origin/commit/8479b5efc7e3cdba2e6f61eb6d62cb8ed4814526))





## [5.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@5.0.0...@energyweb/origin-backend@5.0.1) (2020-04-24)


### Bug Fixes

* **deps:** update dependency class-validator to v0.12.1 ([b5000af](https://github.com/energywebfoundation/origin/commit/b5000af21eb1bc8e1df1eb85cac636cfe5e31adc))
* **deps:** update dependency ts-loader to v7 ([722101a](https://github.com/energywebfoundation/origin/commit/722101a02d82ea125f011de23cd1232e82e7db47))
* **deps:** update nest monorepo to v7.0.8 ([67e8239](https://github.com/energywebfoundation/origin/commit/67e823940e8c671790acbd106af0dc479ec9c23d))
* **origin-backend:** device update ([1cd631b](https://github.com/energywebfoundation/origin/commit/1cd631b38452a1b42f78d28f07348b04ce100e7b))
* **origin-backend:** fix init ([1306a7e](https://github.com/energywebfoundation/origin/commit/1306a7e9c51c537a7e39f63ed56724a82ab1df4b))
* **origin-backend:** fix storing the smart meter reads ([560f1dd](https://github.com/energywebfoundation/origin/commit/560f1ddd1b14c24f8ed9d02eca7d6d344fc29277))
* **origin-backend:** registration ([dffbf50](https://github.com/energywebfoundation/origin/commit/dffbf509fc34fbc247170628a76ed2e02e4b6765))
* **origin-backend:** use repositry.save(enityt) instead of entity.save() ([2f34ca0](https://github.com/energywebfoundation/origin/commit/2f34ca042cc292be46526e555ed49b0fcc4a63e0))
* all energy references to BigNumber ([9265556](https://github.com/energywebfoundation/origin/commit/926555616e2f88dbc6ef824e05becce4d64148e3))
* bin env for migration scripts ([aef836e](https://github.com/energywebfoundation/origin/commit/aef836e0e263076c3bdb6fafb5335a595af9d519))
* migration catalog ([48209a1](https://github.com/energywebfoundation/origin/commit/48209a1357d82e85c0c6a330bde62669dcb98844))
* migrations path fix ([54b4c67](https://github.com/energywebfoundation/origin/commit/54b4c67aec30a2ca469b1218bc824eb66050abc7))
* store certificate energy as a string (maximum 2^256-1) ([2a284a9](https://github.com/energywebfoundation/origin/commit/2a284a9ff3b362dfa41516995b1cadd4c5651194))
* **origin-backend-app:** fix inconsistent build process ([6795770](https://github.com/energywebfoundation/origin/commit/6795770702f1fa52260c9a1c4a6631b2be7ffb05))





# [5.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@4.0.0...@energyweb/origin-backend@5.0.0) (2020-04-08)


### Bug Fixes

* **deps:** update dependency @nestjs/config to v0.4.0 ([e7ac62d](https://github.com/energywebfoundation/origin/commit/e7ac62d728b854cb95b5c9293bc0be70d66aa0f8))
* **deps:** update dependency @nestjs/jwt to v7 ([143fb82](https://github.com/energywebfoundation/origin/commit/143fb82ad08423e05fd4ccd25926cb30c0caa4ff))
* **deps:** update dependency @nestjs/passport to v7 ([be26821](https://github.com/energywebfoundation/origin/commit/be268216980b5b1119638ddae039022aa8e9790a))
* **deps:** update dependency class-validator to v0.11.1 ([5607f1c](https://github.com/energywebfoundation/origin/commit/5607f1cb3ef09e7838ac8fcd4e72538e65bf514e))
* **deps:** update dependency rxjs to v6.5.5 ([2c19e39](https://github.com/energywebfoundation/origin/commit/2c19e39552b2e68a91db9fc8b21127488a9cd576))
* **origin-backend:** fix displaying uploaded files ([97bc31c](https://github.com/energywebfoundation/origin/commit/97bc31cb93cd27e15e7c6a19ee1e90409c2d87a9))
* **origin-backend:** fix saving user settings ([04b5361](https://github.com/energywebfoundation/origin/commit/04b53613aec909e75f1107e6d9dc07c0d27e0b48))
* **origin-backend:** store certificate energy as BigInt ([cbaf676](https://github.com/energywebfoundation/origin/commit/cbaf676b9725d82bdbf5a177cb495afe9710ede4))
* **origin-ui-core:** display notification when users tries to register device without organization ([ff4e0a4](https://github.com/energywebfoundation/origin/commit/ff4e0a44bc5c88f1028699872143a9a8e69c9163))
* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* don't drop schema when run:origin ([57ca815](https://github.com/energywebfoundation/origin/commit/57ca8151bd27555c17031556b5980213d476cea9))
* enable editing account settings ([b058828](https://github.com/energywebfoundation/origin/commit/b058828cafe8e07f0d5b921f8d0c59efc4f67ee7))
* make ContractsLookup part of Configuration ([4fe28c4](https://github.com/energywebfoundation/origin/commit/4fe28c4a79dc17658b067d519c6f0288a6243198))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))
* working exchange integration ([49ced59](https://github.com/energywebfoundation/origin/commit/49ced5996c4198fcbf43b8e0eeaf978182ba3a47))


### chore

* **device-registry:** remove all off-chain components ([d11c834](https://github.com/energywebfoundation/origin/commit/d11c83486a89eab252a88dcf79054383f9ea5152))


### Features

* **origin-backend:** add grid operators ([247a179](https://github.com/energywebfoundation/origin/commit/247a17950ebe917fbf82ecb0dcd25a47caddcc57))
* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* add posting certificates for sale ([84a141a](https://github.com/energywebfoundation/origin/commit/84a141a9868102f1d012170926c2439069716783))
* **issuer:** approval process for private transfers ([b285bfd](https://github.com/energywebfoundation/origin/commit/b285bfdc4c7807a619ded163cc49a83b7545eb88))
* **origin-backend:** add createdAt and updatedAt to every entity ([7aae8c0](https://github.com/energywebfoundation/origin/commit/7aae8c0212ec1c4cb4c0388d69c576ec05f9cdfb))
* **origin-backend:** add findDeviceProductInfo method ([a9a380b](https://github.com/energywebfoundation/origin/commit/a9a380b568b33fa344ee700024d4bbdcedfba830))
* New CertificationRequest structure + use ContractsLookup instead of MarketContractLookup ([cb380c0](https://github.com/energywebfoundation/origin/commit/cb380c05986ee5e8f8fb1398e225ee54147a3936))
* store energy amount in CertificationRequest ([5d756ba](https://github.com/energywebfoundation/origin/commit/5d756ba848245ebf50416d4ce53b61e8e0072ebb))
* support storing OwnershipCommitments off-chain ([6586895](https://github.com/energywebfoundation/origin/commit/658689556bb22a011e5dc947cf288f0b4c2cebcb))


### BREAKING CHANGES

* **device-registry:** The device registry is now entirely on-chain





# [4.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.8.0...@energyweb/origin-backend@4.0.0) (2020-03-16)


### Bug Fixes

* **origin-backend:** getting lastSmartMeterReading from a device ([00cea75](https://github.com/energywebfoundation/origin/commit/00cea7538b3198eb920a484d31922898bab2e1a2))
* store deviceTypes as simple-json ([7c330b6](https://github.com/energywebfoundation/origin/commit/7c330b63aa51cc05c4e9ca452b3b61c93605693c))
* **deps:** update dependency @nestjs/config to v0.3.0 ([4cdd97b](https://github.com/energywebfoundation/origin/commit/4cdd97bf62bcee3249535f90ca573fb2024b5a98))
* **deps:** update dependency ws to v7.2.3 ([14b2218](https://github.com/energywebfoundation/origin/commit/14b2218ad5df9b5873d59f70b317cbc3f5d8b158))
* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))
* **deps:** update dependency ws to v7.2.2 ([f04bd68](https://github.com/energywebfoundation/origin/commit/f04bd684c34ca65cf1096eaae2de1aae28170e01))
* **deps:** update nest monorepo to v6.11.11 ([8d93078](https://github.com/energywebfoundation/origin/commit/8d93078773c86dd04ffbf5419fa0b5fc94a6b7bf))


### Features

* add ExternalDeviceIdTypes to OriginConfiguration + unify all configuration items into one db table ([1469e32](https://github.com/energywebfoundation/origin/commit/1469e32ea369daf7f1b910c201670836248914ff))
* Regions and DeviceTypes in OriginConfiguration are now hard-typed ([23a1f29](https://github.com/energywebfoundation/origin/commit/23a1f29a890192b45b0f270d1ad48a48c47b5246))


### BREAKING CHANGES

* Configuration Client now works differently





# [3.8.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.7.1...@energyweb/origin-backend@3.8.0) (2020-03-02)


### Bug Fixes

* **deps:** update dependency @nestjs/jwt to v6.1.2 ([a8a1d9b](https://github.com/energywebfoundation/origin/commit/a8a1d9b9071026b2cfed345dd7bdfe80a1cd21b9))
* **deps:** update dependency typeorm to v0.2.24 ([fb6c68b](https://github.com/energywebfoundation/origin/commit/fb6c68b324524fe814859f6274428ddc4f938762))
* **deps:** update nest monorepo to v6.11.8 ([2934e78](https://github.com/energywebfoundation/origin/commit/2934e780c8555383427cc7c8e22e69fff59ec10f))


### Features

* Off-chain smart meter readings ([4dfbff0](https://github.com/energywebfoundation/origin/commit/4dfbff036b20578f6c2d960328a52deb0f0dff15))





## [3.7.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.7.0...@energyweb/origin-backend@3.7.1) (2020-02-17)

**Note:** Version bump only for package @energyweb/origin-backend





# [3.7.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.6.0...@energyweb/origin-backend@3.7.0) (2020-02-17)


### Bug Fixes

* **deps:** update dependency @nestjs/config to ^0.2.0 ([5f8f814](https://github.com/energywebfoundation/origin/commit/5f8f814114b3ae42611150c0a55e9721a7672e01))


### Features

* **origin-backend:** exchange module import ([16417a4](https://github.com/energywebfoundation/origin/commit/16417a4c6c8728f2274a165859c5b119dc517e9a))





# [3.6.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.5.0...@energyweb/origin-backend@3.6.0) (2020-02-12)


### Bug Fixes

* **deps:** pin dependencies ([2088944](https://github.com/energywebfoundation/origin/commit/20889448a7923ac3c459806a119faae47645d8ba))
* **origin-backend:** .env file location ([ae0a812](https://github.com/energywebfoundation/origin/commit/ae0a8125bf38a030956fb9ecea74e591d30f9434))
* fix demand matching and saving demand partially filled events ([6462129](https://github.com/energywebfoundation/origin/commit/646212912192599a52454d3e498bf73c4314a0ac))


### Features

* **exchange:** forwarded integration. refactoring ([b2d8ac0](https://github.com/energywebfoundation/origin/commit/b2d8ac0e70a298e790e9115a9dfddaa98921ec82))
* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





# [3.5.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.4.0...@energyweb/origin-backend@3.5.0) (2020-02-04)


### Bug Fixes

* **deps:** update nest monorepo to v6.11.5 ([0ddc961](https://github.com/energywebfoundation/origin/commit/0ddc9619933b5dd0585c4767b7229bf502e55ccf))


### Features

* add a WebSocket-based event gateway to the backend + create entities for Demand and Device ([af703ce](https://github.com/energywebfoundation/origin/commit/af703ce9065ea2dc3c2034ca571b563886d12a55))
* email notifications for organization status change, member invitation and removal ([a2f0dae](https://github.com/energywebfoundation/origin/commit/a2f0dae5dab021980c702dc339654d52af2db47d))





# [3.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.3.0...@energyweb/origin-backend@3.4.0) (2020-01-31)


### Bug Fixes

* **deps:** update dependency axios to v0.19.1 ([40aa752](https://github.com/energywebfoundation/origin/commit/40aa7522c28cb2f6c32608669f154633be749649))
* **deps:** update dependency axios to v0.19.2 ([696eb46](https://github.com/energywebfoundation/origin/commit/696eb46fd2c7d26c223baaaf9f75d7943fc71517))


### Features

* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
* **origin-backend:** implement organization invitation ([b6d6609](https://github.com/energywebfoundation/origin/commit/b6d6609f0031c51e7a6943590b60607e1035ede4))





# [3.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.2.0...@energyweb/origin-backend@3.3.0) (2020-01-17)


### Bug Fixes

* **origin-backend:** add default config value ([49f3d50](https://github.com/energywebfoundation/origin/commit/49f3d50c5f9e938e5597e54d490879d2d19c671d))
* **origin-backend:** change test command ([41e4892](https://github.com/energywebfoundation/origin/commit/41e4892c90c84a5fb6ebfa125f0c0334b947599c))


### Features

* **origin-backend:** implement authentication ([baa9fea](https://github.com/energywebfoundation/origin/commit/baa9feaa3567b104bcf46134526097c8fc8b86fb))





# [3.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.1.0...@energyweb/origin-backend@3.2.0) (2020-01-07)


### Bug Fixes

* **origin-backend:** fix uploads directory location ([82ddef3](https://github.com/energywebfoundation/origin/commit/82ddef36f673406d808200a0117f41f32ba295eb))


### Features

* complete backend for registering organization ([b0dd715](https://github.com/energywebfoundation/origin/commit/b0dd71550011b97765362aeea87285a75f8119c1))
* **origin-backend:** add endpoint to save organizations ([7382725](https://github.com/energywebfoundation/origin/commit/738272579d8214315323e79d163fe51e14676155))





# [3.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@3.0.0...@energyweb/origin-backend@3.1.0) (2019-12-20)


### Features

* **origin-backend:** add possibility to store images ([faf0e74](https://github.com/energywebfoundation/origin/commit/faf0e748b1980a4502764fbe78dc555927b9b398))
* **origin-backend:** add support for storing Country ([99e754e](https://github.com/energywebfoundation/origin/commit/99e754e0f46fa4aae24379ba463513df94e9081a))





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@2.1.0...@energyweb/origin-backend@3.0.0) (2019-12-19)


### Features

* **origin-backend:** Change the way we approach POST methods + add a Compliance endpoint ([f7da2d5](https://github.com/energywebfoundation/origin/commit/f7da2d5c118a9169a123201375a254e5a203bedf))


### BREAKING CHANGES

* **origin-backend:** Changed the way we approach POST methods. Use request body parameters instead of in-URL parameters





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@2.0.0...@energyweb/origin-backend@2.1.0) (2019-12-17)


### Features

* **origin-backend:** New endpoint: Currency ([86b59db](https://github.com/energywebfoundation/origin/commit/86b59dbab4f25f3c2b756c97b8c5a72bfa3f7eda))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.4...@energyweb/origin-backend@2.0.0) (2019-12-12)


### Bug Fixes

* retry yarn add when building dockerfiles ([#366](https://github.com/energywebfoundation/origin/issues/366)) ([551c1f5](https://github.com/energywebfoundation/origin/commit/551c1f526c4f04c79cf2d5e363feb7340d01e6f0))


* [FIX] Backend hash storing (#341) ([b239101](https://github.com/energywebfoundation/origin/commit/b239101f51cffd7e37c9ea51654a75804cf502ed)), closes [#341](https://github.com/energywebfoundation/origin/issues/341)


### BREAKING CHANGES

* Changed the API endpoints from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* feat(utils-general): use the new URL structure when fetching off-chain data
* Changed the API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(user-registry): adjust to breaking changes
* Updated User API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(asset-registry): adjust to breaking changes
* Updated Asset API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(origin): fix constructor weird formatting

* fix(market): storing off-chain data references on-chain
* New contracts for PurchasableCertificate + Updated Market API endpoints of the backend from http://example.url/<marketLogicAddress>/<entity>/<id> to http://example.url/<marketLogicAddress>/<entity>/<id>/<offChainDataHash>

* chore(event-listener): more understandable tests

* fix(event-listener): make scan interval faster for tests

* feat(origin-backend): use a simpler URL structure
* The URL structure of the API changed to only store hashes, omitting IDs, entity types and market lookup contracts used previously

* chore(origin-backend-client): use only POST methods instead of POST and PUT
* Use the .insert() method instead of .insertOrUpdate()

* chore(utils-general): use .insert instead of .insertOrUpdate

* fix(origin-backend): return 200 on POSTing the same entity

* chore(utils-general): remove abstract getUrl()

* chore(user-registry): remove specific getUrl()

* chore(device-registry): remove specific getUrl()

* chore(origin): remove specific getUrl()

* chore(market): remove specific getUrl()

* chore(monorepo): reorder test:serial

* fix(origin-backend): adjust tests to new POST behaviour

* chore(monorepo): Add an ADR for simplifying off-chain data storage





## [1.3.4](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.3...@energyweb/origin-backend@1.3.4) (2019-11-26)


### Bug Fixes

* **docker-compose:** map whole db dir for origin-backend ([#264](https://github.com/energywebfoundation/origin/issues/264)) ([75560e4](https://github.com/energywebfoundation/origin/commit/75560e4f52d2e5e1aeae61fe884737df0303b065))





## [1.3.3](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.2...@energyweb/origin-backend@1.3.3) (2019-11-11)


### Bug Fixes

* fix yarn clean command ([#224](https://github.com/energywebfoundation/origin/issues/224)) ([e07e9d8](https://github.com/energywebfoundation/origin/commit/e07e9d85de1b80c9f1a721398e41d82db580049c))
* normalize API urls, fix solar simulator ([#228](https://github.com/energywebfoundation/origin/issues/228)) ([aeed701](https://github.com/energywebfoundation/origin/commit/aeed701b8d541fb30a26f63b84d716bea61b7101))
* **origin-backend:** docker deployment fixes ([#203](https://github.com/energywebfoundation/origin/issues/203)) ([2fc7fe9](https://github.com/energywebfoundation/origin/commit/2fc7fe9cc4394496fcacc7f666ff27d97f0ca14c))
* **origin-backend:** prepare for docker setup ([#200](https://github.com/energywebfoundation/origin/issues/200)) ([ca363d0](https://github.com/energywebfoundation/origin/commit/ca363d0935a121d23e7b37ebcaa187904ebc813c))





## [1.3.2](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.1...@energyweb/origin-backend@1.3.2) (2019-10-30)


### Bug Fixes

* makefiles escaped variables ([052810c](https://github.com/energywebfoundation/origin/commit/052810c7ecf6343f044ed4e9922fd57107ab61e7))
* whitespaces ([3380deb](https://github.com/energywebfoundation/origin/commit/3380deb25954f8d82726f748c0f944bebed97ac0))





## [1.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend@1.3.0...@energyweb/origin-backend@1.3.1) (2019-10-30)

**Note:** Version bump only for package @energyweb/origin-backend





# 1.3.0 (2019-10-25)


### Features

* **backend:** Replace testbackend with the new origin-backend ([#137](https://github.com/energywebfoundation/origin/issues/137)) ([c428e7d](https://github.com/energywebfoundation/origin/commit/c428e7d44300ae306a9e759fc8897135e9d0e1be))





# 1.2.0 (2019-10-23)


### Bug Fixes

* **deps:** update dependency express to v4.17.1 ([#63](https://github.com/energywebfoundation/ew-utils-testbackend/issues/63)) ([1bcac38](https://github.com/energywebfoundation/ew-utils-testbackend/commit/1bcac38))
* **deps:** update dependency fs-extra to v8.1.0 ([#64](https://github.com/energywebfoundation/ew-utils-testbackend/issues/64)) ([ccd9ed5](https://github.com/energywebfoundation/ew-utils-testbackend/commit/ccd9ed5))
* fix demo deployment and update dependencies ([#84](https://github.com/energywebfoundation/ew-utils-testbackend/issues/84)) ([5d366e6](https://github.com/energywebfoundation/ew-utils-testbackend/commit/5d366e6))
* publish access configs ([bd4fa2b](https://github.com/energywebfoundation/ew-utils-testbackend/commit/bd4fa2b))
* publish access configs ([ecc00a2](https://github.com/energywebfoundation/ew-utils-testbackend/commit/ecc00a2))


### Features

* **user-registry:** User Off-Chain Properties ([#15](https://github.com/energywebfoundation/ew-utils-testbackend/issues/15)) ([b6c2a31](https://github.com/energywebfoundation/ew-utils-testbackend/commit/b6c2a31))
* consuming assets unique storage ([#86](https://github.com/energywebfoundation/ew-utils-testbackend/issues/86)) ([226eadf](https://github.com/energywebfoundation/ew-utils-testbackend/commit/226eadf))
* setup prettier and lint config for Origin UI ([#20](https://github.com/energywebfoundation/ew-utils-testbackend/issues/20)) ([9cb4486](https://github.com/energywebfoundation/ew-utils-testbackend/commit/9cb4486))
