# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@5.0.1...@energyweb/origin-backend-core@5.1.0) (2020-08-25)


### Features

* **origin-backend:** expose createdAt in the invitation interface ([d11273b](https://github.com/energywebfoundation/origin/commit/d11273b026ba1e412db21d3ebe860c72995d01ed))





## [5.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@5.0.0...@energyweb/origin-backend-core@5.0.1) (2020-08-12)

**Note:** Version bump only for package @energyweb/origin-backend-core





# [5.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@4.3.0...@energyweb/origin-backend-core@5.0.0) (2020-08-10)


### Bug Fixes

* **deps:** update dependency ethers to v5.0.8 ([c69bde0](https://github.com/energywebfoundation/origin/commit/c69bde05c4f0eba5dbc49833f266af24c84c0187))


### chore

* **origin-backend-core:** use IOrganization in IUser ([a20cd64](https://github.com/energywebfoundation/origin/commit/a20cd6458d564d22660b9f540437e3b5e01ff1c9))


### BREAKING CHANGES

* **origin-backend-core:** IUser.organization changed from number to full organization object





# [4.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@4.2.0...@energyweb/origin-backend-core@4.3.0) (2020-08-06)


### Bug Fixes

* **deps:** update dependency class-transformer to v0.3.1 ([e827bbb](https://github.com/energywebfoundation/origin/commit/e827bbbc6f357c135d2d803bb82ad8774914913a))
* **origin-ui-core:** store org id for non-admin and non-support agent ([7498fb4](https://github.com/energywebfoundation/origin/commit/7498fb49c9e24856c2a8d4c8c0b57b2ca8d8923b))


### Features

* **origin-backend:** getAll Devices with relations ([b644f38](https://github.com/energywebfoundation/origin/commit/b644f38b6b6a3b7cff7039795df31d25553455fc))





# [4.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@4.1.0...@energyweb/origin-backend-core@4.2.0) (2020-07-16)


### Features

* **origin-backend-core:** add EmailConfirmation interfaces ([a28eca9](https://github.com/energywebfoundation/origin/commit/a28eca938407a7e9e02f0e3ce0ad69cf011dd25f))





# [4.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@4.0.1...@energyweb/origin-backend-core@4.1.0) (2020-07-08)


### Bug Fixes

* **origin-ui-core:** use userId as ownerId if no org ([4c3eed9](https://github.com/energywebfoundation/origin/commit/4c3eed97e1629b3bc02ba601f77872d584b0c3bb))


### Features

* **origin-backend-core:** approvedDate and revokedDate added to ICertificationRequest ([1d2d489](https://github.com/energywebfoundation/origin/commit/1d2d489bbd4adde96013509e6795c4d5f6aa9de4))





## [4.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@4.0.0...@energyweb/origin-backend-core@4.0.1) (2020-06-16)

**Note:** Version bump only for package @energyweb/origin-backend-core





# [4.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@3.0.1...@energyweb/origin-backend-core@4.0.0) (2020-06-16)


### Bug Fixes

* implement a certification request data queue ([78cbd4a](https://github.com/energywebfoundation/origin/commit/78cbd4a7a36959cbb0820cf17dc277f0bf5ae823))


### chore

* remove unused Lead User references ([aaae5df](https://github.com/energywebfoundation/origin/commit/aaae5df4b0abd1b69924981eb2dc8b7e5df31e63))


### Features

* **origin-ui:** show user role on user table ([e1754eb](https://github.com/energywebfoundation/origin/commit/e1754ebad64973e619ba88715527dc853a28ad0b))
* Updating organization user roles ([c1096f2](https://github.com/energywebfoundation/origin/commit/c1096f28c1b48e606d5deeda7f33720613764326))


### BREAKING CHANGES

* Lead user is no longer needed to create an organization





## [3.0.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@3.0.0...@energyweb/origin-backend-core@3.0.1) (2020-05-29)


### Bug Fixes

* certificate tests ([923eb7e](https://github.com/energywebfoundation/origin/commit/923eb7e2f17c9d882077a2810d738c703946aeba))
* linting errors ([c6a6c65](https://github.com/energywebfoundation/origin/commit/c6a6c6519441582b397616b40bbe9b72cb550c98))
* ownership commitments permissions + store original requestor ([1751d30](https://github.com/energywebfoundation/origin/commit/1751d3009d11f92d23bc9834632ef5b0ffb5bcee))





# [3.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@2.2.0...@energyweb/origin-backend-core@3.0.0) (2020-05-15)


### Bug Fixes

* store [] as the default for device.files ([52e5fcc](https://github.com/energywebfoundation/origin/commit/52e5fccdeb303133b3db9413fc317e4a1c60ebca))
* **origin-backend-core:** handle no user available case ([dca1280](https://github.com/energywebfoundation/origin/commit/dca12805231c239dd347bb55544408fc47b3a266))


### chore

* **origin-backend-core:** rename user roles ([e098a30](https://github.com/energywebfoundation/origin/commit/e098a30a5f6552403cfe6aac9650f7bf1609972e))
* **origin-backend-core:** replace UserRegisterData ([d82b9c4](https://github.com/energywebfoundation/origin/commit/d82b9c45c71000a6ad35e1b80e3a19fd59d97656))
* **origin-backend-core:** rm autopublish remaining code ([c2a1262](https://github.com/energywebfoundation/origin/commit/c2a1262ef92597a163bfb31a00613abba2f009a0))


### Features

* **origin-backend-core:** allow to check multiple roles in LoggedInUser ([7cf391e](https://github.com/energywebfoundation/origin/commit/7cf391e7953890aa0d5a7378aecd75204dff7550))
* add meterStats to Device for un/certified meter readings reference ([627d785](https://github.com/energywebfoundation/origin/commit/627d7855506f52cb70ee083844ef2664b9227a0b))
* **origin-backend:** added automatic post for sale flag, API for updating settings ([a871f60](https://github.com/energywebfoundation/origin/commit/a871f601ea611ca5e51fbe7cd0d0b0fcf4d2cea3))
* **origin-backend-core:** allow to test multiple roles ([98bcf7f](https://github.com/energywebfoundation/origin/commit/98bcf7f7b582b454d2753d372c042832bad238b0))
* **origin-backend-core:** RolesGuard and decorator ([56d5b50](https://github.com/energywebfoundation/origin/commit/56d5b50025b26d973ccc36fc271d934ccb5376f3))
* Detect and store the whole CertificationRequest on the backend ([613eb28](https://github.com/energywebfoundation/origin/commit/613eb28eeae25ec414b393f61311dbfb679351d4))
* **origin-backend-core:** added LoggerInUser abstraction ([9ceb9ac](https://github.com/energywebfoundation/origin/commit/9ceb9ac2b1669d4c7e2a8fa186603f37134109d9))


### BREAKING CHANGES

* **origin-backend-core:** UserRegisterData type replace with UserRegistrationData
* **origin-backend-core:** Role enum items renamed
* **origin-backend-core:** autoPublish is not longer a member of IUser interface





# [2.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@2.1.0...@energyweb/origin-backend-core@2.2.0) (2020-04-24)


### Bug Fixes

* **deps:** update dependency precise-proofs-js to v1.1.0 ([b1f0bb7](https://github.com/energywebfoundation/origin/commit/b1f0bb723a4a006357ed3b7dcad7494c70b0c5b4))
* all energy references to BigNumber ([9265556](https://github.com/energywebfoundation/origin/commit/926555616e2f88dbc6ef824e05becce4d64148e3))
* store certificate energy as a string (maximum 2^256-1) ([2a284a9](https://github.com/energywebfoundation/origin/commit/2a284a9ff3b362dfa41516995b1cadd4c5651194))
* use BigNumber in MAX_ENERGY_PER_CERTIFICATE ([4694664](https://github.com/energywebfoundation/origin/commit/46946644adce8a979da8698d201a1215cd77eced))


### Features

* add support for device grid operator property ([f6d77f3](https://github.com/energywebfoundation/origin/commit/f6d77f327a7676c3e742cc8a022e5c085cf66e39))
* required device external IDs ([0d619d1](https://github.com/energywebfoundation/origin/commit/0d619d1310a69f53930fa85f25f0c24e7ce4860d))





# [2.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@2.0.0...@energyweb/origin-backend-core@2.1.0) (2020-04-08)


### Bug Fixes

* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* make ContractsLookup part of Configuration ([4fe28c4](https://github.com/energywebfoundation/origin/commit/4fe28c4a79dc17658b067d519c6f0288a6243198))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))


### Features

* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* **issuer:** approval process for private transfers ([b285bfd](https://github.com/energywebfoundation/origin/commit/b285bfdc4c7807a619ded163cc49a83b7545eb88))
* New CertificationRequest structure + use ContractsLookup instead of MarketContractLookup ([cb380c0](https://github.com/energywebfoundation/origin/commit/cb380c05986ee5e8f8fb1398e225ee54147a3936))
* store energy amount in CertificationRequest ([5d756ba](https://github.com/energywebfoundation/origin/commit/5d756ba848245ebf50416d4ce53b61e8e0072ebb))
* support storing OwnershipCommitments off-chain ([6586895](https://github.com/energywebfoundation/origin/commit/658689556bb22a011e5dc947cf288f0b4c2cebcb))





# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@1.3.0...@energyweb/origin-backend-core@2.0.0) (2020-03-16)


### Bug Fixes

* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))
* store deviceTypes as simple-json ([7c330b6](https://github.com/energywebfoundation/origin/commit/7c330b63aa51cc05c4e9ca452b3b61c93605693c))


### Features

* add ExternalDeviceIdTypes to OriginConfiguration + unify all configuration items into one db table ([1469e32](https://github.com/energywebfoundation/origin/commit/1469e32ea369daf7f1b910c201670836248914ff))
* Regions and DeviceTypes in OriginConfiguration are now hard-typed ([23a1f29](https://github.com/energywebfoundation/origin/commit/23a1f29a890192b45b0f270d1ad48a48c47b5246))


### BREAKING CHANGES

* Configuration Client now works differently





# [1.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@1.2.0...@energyweb/origin-backend-core@1.3.0) (2020-03-02)


### Features

* Off-chain smart meter readings ([4dfbff0](https://github.com/energywebfoundation/origin/commit/4dfbff036b20578f6c2d960328a52deb0f0dff15))





# [1.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@1.1.0...@energyweb/origin-backend-core@1.2.0) (2020-02-12)


### Features

* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





# [1.1.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@1.0.0...@energyweb/origin-backend-core@1.1.0) (2020-02-04)


### Features

* Add definitions for Demand, Device and Events ([19841b7](https://github.com/energywebfoundation/origin/commit/19841b72eb792ef5828218503badd2018b0c39a1))
* email notifications for organization status change, member invitation and removal ([a2f0dae](https://github.com/energywebfoundation/origin/commit/a2f0dae5dab021980c702dc339654d52af2db47d))





# [1.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@0.1.1...@energyweb/origin-backend-core@1.0.0) (2020-01-31)


### Features

* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
* **origin-backend-core:** add OrganizationInvitation structure ([0c499ac](https://github.com/energywebfoundation/origin/commit/0c499ac499a5335d253149ed3b650a9024218ac2))


### BREAKING CHANGES

* **origin-backend-core:** reorganize organization and user types interfaces





## [0.1.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-core@0.1.0...@energyweb/origin-backend-core@0.1.1) (2020-01-17)

**Note:** Version bump only for package @energyweb/origin-backend-core





# 0.1.0 (2020-01-07)


### Features

* complete backend for registering organization ([b0dd715](https://github.com/energywebfoundation/origin/commit/b0dd71550011b97765362aeea87285a75f8119c1))
