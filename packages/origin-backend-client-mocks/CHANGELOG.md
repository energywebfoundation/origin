# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client-mocks@1.0.0...@energyweb/origin-backend-client-mocks@2.0.0) (2020-04-08)


### Bug Fixes

* adjust application to off-chain device registry ([a3583fb](https://github.com/energywebfoundation/origin/commit/a3583fb6c80604c88ef69724c69229a74320ff95))
* make ContractsLookup part of Configuration ([4fe28c4](https://github.com/energywebfoundation/origin/commit/4fe28c4a79dc17658b067d519c6f0288a6243198))
* remove MarketUser from UI ([9d15489](https://github.com/energywebfoundation/origin/commit/9d15489fa976fb9861337de0b8cbc56a06477203))


### chore

* **device-registry:** remove all off-chain components ([d11c834](https://github.com/energywebfoundation/origin/commit/d11c83486a89eab252a88dcf79054383f9ea5152))


### Features

* add ability to autogenerate external device ids ([822b752](https://github.com/energywebfoundation/origin/commit/822b7523730b726aeb2f7f09922d1742f3faa075))
* add ORGANIZATION_REMOVED_MEMBER and DEVICE_STATUS_CHANGED email notifications ([384f90f](https://github.com/energywebfoundation/origin/commit/384f90fa18bf9ee7a38648afa28de95ca7f64071))
* add posting certificates for sale ([84a141a](https://github.com/energywebfoundation/origin/commit/84a141a9868102f1d012170926c2439069716783))
* **issuer:** approval process for private transfers ([b285bfd](https://github.com/energywebfoundation/origin/commit/b285bfdc4c7807a619ded163cc49a83b7545eb88))
* New CertificationRequest structure + use ContractsLookup instead of MarketContractLookup ([cb380c0](https://github.com/energywebfoundation/origin/commit/cb380c05986ee5e8f8fb1398e225ee54147a3936))
* store energy amount in CertificationRequest ([5d756ba](https://github.com/energywebfoundation/origin/commit/5d756ba848245ebf50416d4ce53b61e8e0072ebb))
* support storing OwnershipCommitments off-chain ([6586895](https://github.com/energywebfoundation/origin/commit/658689556bb22a011e5dc947cf288f0b4c2cebcb))


### BREAKING CHANGES

* **device-registry:** The device registry is now entirely on-chain





# [1.0.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client-mocks@0.4.0...@energyweb/origin-backend-client-mocks@1.0.0) (2020-03-16)


### Bug Fixes

* **origin-backend-client-mocks:** saving/reading smart meter readings ([b950784](https://github.com/energywebfoundation/origin/commit/b950784ef771808556497dc61c56cd451a94658a))
* fetch all device smart meter readings only on-demand ([0708917](https://github.com/energywebfoundation/origin/commit/07089170e80de59503c299755f5bdf5e26005a3b))


### Features

* add ExternalDeviceIdTypes to OriginConfiguration + unify all configuration items into one db table ([1469e32](https://github.com/energywebfoundation/origin/commit/1469e32ea369daf7f1b910c201670836248914ff))


### BREAKING CHANGES

* Configuration Client now works differently





# [0.4.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client-mocks@0.3.0...@energyweb/origin-backend-client-mocks@0.4.0) (2020-03-02)


### Features

* Off-chain smart meter readings ([4dfbff0](https://github.com/energywebfoundation/origin/commit/4dfbff036b20578f6c2d960328a52deb0f0dff15))





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client-mocks@0.2.0...@energyweb/origin-backend-client-mocks@0.3.0) (2020-02-12)


### Features

* change certification requests to be off-chain evidence based ([555c696](https://github.com/energywebfoundation/origin/commit/555c696aff17bafd11c8c5403add627d6c95fbd9))





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-backend-client-mocks@0.1.0...@energyweb/origin-backend-client-mocks@0.2.0) (2020-02-04)


### Features

* email notifications for organization status change, member invitation and removal ([a2f0dae](https://github.com/energywebfoundation/origin/commit/a2f0dae5dab021980c702dc339654d52af2db47d))
* Unify all data clients into an OffChainData definition ([6aff08d](https://github.com/energywebfoundation/origin/commit/6aff08d9a36eaec5c2e6a102f5c1979d8b459982))





# 0.1.0 (2020-01-31)


### Features

* implement removing user from organization ([4c62da9](https://github.com/energywebfoundation/origin/commit/4c62da9837620dbfbca14e63fd7855de32c7dac5))
