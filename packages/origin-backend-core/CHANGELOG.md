# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
