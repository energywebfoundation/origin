# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-certificate-view@0.3.0...@energyweb/origin-ui-certificate-view@0.3.1) (2022-01-18)

**Note:** Version bump only for package @energyweb/origin-ui-certificate-view





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-certificate-view@0.1.0...@energyweb/origin-ui-certificate-view@0.3.0) (2021-12-30)


### Bug Fixes

* **origin-ui-certificate:** add select for beneficiaries when claiming from exchange ([8fc1c91](https://github.com/energywebfoundation/origin/commit/8fc1c91d0fcb2636ffcee18a873ef7b19e76a892))
* **origin-ui-certificate:** use companyBeneficiaries endpoint to get beneficiaries for retire-action ([9b040dd](https://github.com/energywebfoundation/origin/commit/9b040dd03d034b4bf8e37d261d5c5d980f8c7137))


### chore

* update to latest versions of [@mui](https://github.com/mui) packages ([2f53854](https://github.com/energywebfoundation/origin/commit/2f53854070f20f9251992fdd3ac92812c5d83060))


### Features

* **origin-ui-certificate-view:** allow bulk actions only for blockchain inbox ([d4e7dac](https://github.com/energywebfoundation/origin/commit/d4e7dacb4f4284c09161c66b3f5d1d2ef3096201))
* **origin-ui-certificate:** add claim action to exchange inbox ([978f5eb](https://github.com/energywebfoundation/origin/commit/978f5eb1b0a4a8650c41f8d5dae7d687d4bf7e48))
* **origin-ui-certificate:** add export action to exchange inbox ([01e565f](https://github.com/energywebfoundation/origin/commit/01e565f51c4deb0366d1e63fc3ca655157950088))
* **origin-ui-certificate:** add tooltip and disable select if there are no beneficiaries created by user ([abf759a](https://github.com/energywebfoundation/origin/commit/abf759a456743e80933706edacdca272ecca23cb))
* **origin-ui-certificate:** adjust certificate pages to match blockchain account options ([ab9cff8](https://github.com/energywebfoundation/origin/commit/ab9cff81c78e21e0973e9457b48dcdb241d64806))
* **origin-ui-certificate:** make claim-action form, adjust displaying of claimed certificates in claims-report and certificate-detail-view ([0bf011d](https://github.com/energywebfoundation/origin/commit/0bf011d5f189f6b45db1d2237f232a446e100328))
* **origin-ui-certificate:** move from external web3 package to native web3 package usage ([697831a](https://github.com/energywebfoundation/origin/commit/697831a44b21ba906b809eeb0b8e0a8d9e3db13b))
* **ui-packages:** update ui to use new module ([4f130a9](https://github.com/energywebfoundation/origin/commit/4f130a919a09d483aca4a28e98d5b4b9d5c2b123))


### BREAKING CHANGES

* package now uses @mui/* packages instead of @material-ui/* ones
* **origin-ui-certificate:** CertificateApp now expects allowedChainIds to be supplied as env variable from the root, packages now have peerDep of origin-ui-web3 package





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-certificate-view@0.1.0...@energyweb/origin-ui-certificate-view@0.2.0) (2021-12-24)


### Bug Fixes

* **origin-ui-certificate:** add select for beneficiaries when claiming from exchange ([8fc1c91](https://github.com/energywebfoundation/origin/commit/8fc1c91d0fcb2636ffcee18a873ef7b19e76a892))
* **origin-ui-certificate:** use companyBeneficiaries endpoint to get beneficiaries for retire-action ([9b040dd](https://github.com/energywebfoundation/origin/commit/9b040dd03d034b4bf8e37d261d5c5d980f8c7137))


### chore

* update to latest versions of [@mui](https://github.com/mui) packages ([2f53854](https://github.com/energywebfoundation/origin/commit/2f53854070f20f9251992fdd3ac92812c5d83060))


### Features

* **origin-ui-certificate:** add claim action to exchange inbox ([978f5eb](https://github.com/energywebfoundation/origin/commit/978f5eb1b0a4a8650c41f8d5dae7d687d4bf7e48))
* **origin-ui-certificate:** add export action to exchange inbox ([01e565f](https://github.com/energywebfoundation/origin/commit/01e565f51c4deb0366d1e63fc3ca655157950088))
* **origin-ui-certificate:** add tooltip and disable select if there are no beneficiaries created by user ([abf759a](https://github.com/energywebfoundation/origin/commit/abf759a456743e80933706edacdca272ecca23cb))
* **origin-ui-certificate:** adjust certificate pages to match blockchain account options ([ab9cff8](https://github.com/energywebfoundation/origin/commit/ab9cff81c78e21e0973e9457b48dcdb241d64806))
* **origin-ui-certificate:** make claim-action form, adjust displaying of claimed certificates in claims-report and certificate-detail-view ([0bf011d](https://github.com/energywebfoundation/origin/commit/0bf011d5f189f6b45db1d2237f232a446e100328))
* **origin-ui-certificate:** move from external web3 package to native web3 package usage ([697831a](https://github.com/energywebfoundation/origin/commit/697831a44b21ba906b809eeb0b8e0a8d9e3db13b))
* **ui-packages:** update ui to use new module ([4f130a9](https://github.com/energywebfoundation/origin/commit/4f130a919a09d483aca4a28e98d5b4b9d5c2b123))


### BREAKING CHANGES

* package now uses @mui/* packages instead of @material-ui/* ones
* **origin-ui-certificate:** CertificateApp now expects allowedChainIds to be supplied as env variable from the root, packages now have peerDep of origin-ui-web3 package





# 0.1.0 (2021-09-17)


### Bug Fixes

* **origin-ui-certificate:** display device images in certificate detail-view carousel ([d995c51](https://github.com/energywebfoundation/origin/commit/d995c5126656e854759ca223cf9515440e8b743d))


### Features

* add loading state for table actions, improve actions typings ([6a77128](https://github.com/energywebfoundation/origin/commit/6a771283ae4535ca1feaa731267a7de739177af5))
* **origin-certificate-view:** move withMetamask hoc to blockchain inbox actions ([d38aa91](https://github.com/energywebfoundation/origin/commit/d38aa91dc4583742b1836256c5959107f11e10de))
* **origin-ui-certificate-view:** create package ([690711f](https://github.com/energywebfoundation/origin/commit/690711f761ecf8ac98e684fe95fa582a63d80e05))
* **origin-ui-certificate:** add certificate import page ([df1b15b](https://github.com/energywebfoundation/origin/commit/df1b15bb7872409b0caf2d084e174077e5c1b61d))
