# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-user-view@0.3.0...@energyweb/origin-ui-user-view@0.3.1) (2022-01-18)

**Note:** Version bump only for package @energyweb/origin-ui-user-view





# [0.3.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-user-view@0.1.0...@energyweb/origin-ui-user-view@0.3.0) (2021-12-30)


### Bug Fixes

* **origin-ui-user:** add admin org-view, fix login re-render bug, adjust routes names & labels, correctly log errors ([b1ad9ad](https://github.com/energywebfoundation/origin/commit/b1ad9ad8258a32cb8a1eda3dc18549641ac4c2af))
* **origin-ui-user:** remove organization-data dependency ([a9e5309](https://github.com/energywebfoundation/origin/commit/a9e530943c38163998aa13f6361bd756b284ccdb))


### chore

* update to latest versions of [@mui](https://github.com/mui) packages ([2f53854](https://github.com/energywebfoundation/origin/commit/2f53854070f20f9251992fdd3ac92812c5d83060))


### Features

* **origin-ui-user:** add All Organizations page into admin-ui app ([a66bad9](https://github.com/energywebfoundation/origin/commit/a66bad931a8c59c2a8d021cad546c9d4c47f7e88))
* **origin-ui-user:** add RequestResetPassword and ResetPassword pages, create LoginLayout wrapper ([0557a10](https://github.com/energywebfoundation/origin/commit/0557a101afa762ad92fd20714e3e07e7d769d47e))
* **origin-ui-user:** add self-ownership switch ([cb61aa6](https://github.com/energywebfoundation/origin/commit/cb61aa6dc0865adae57e791618a41d805d731be2))
* **origin-ui-user:** connect reset password ui to api ([cee02f9](https://github.com/energywebfoundation/origin/commit/cee02f9215b72323c78ffd988f74bd4b98df218e))
* **origin-ui-user:** move from external web3 package to native web3 package usage ([9d7de59](https://github.com/energywebfoundation/origin/commit/9d7de595a17edfaa80a08314e66dfddfdb6f571f))


### BREAKING CHANGES

* package now uses @mui/* packages instead of @material-ui/* ones
* **origin-ui-user:** UserApp now expects allowedChainIds to be supplied as env variable from the root, packages now have peerDep of origin-ui-web3 package





# [0.2.0](https://github.com/energywebfoundation/origin/compare/@energyweb/origin-ui-user-view@0.1.0...@energyweb/origin-ui-user-view@0.2.0) (2021-12-24)


### Bug Fixes

* **origin-ui-user:** add admin org-view, fix login re-render bug, adjust routes names & labels, correctly log errors ([b1ad9ad](https://github.com/energywebfoundation/origin/commit/b1ad9ad8258a32cb8a1eda3dc18549641ac4c2af))
* **origin-ui-user:** remove organization-data dependency ([a9e5309](https://github.com/energywebfoundation/origin/commit/a9e530943c38163998aa13f6361bd756b284ccdb))


### chore

* update to latest versions of [@mui](https://github.com/mui) packages ([2f53854](https://github.com/energywebfoundation/origin/commit/2f53854070f20f9251992fdd3ac92812c5d83060))


### Features

* **origin-ui-user:** add All Organizations page into admin-ui app ([a66bad9](https://github.com/energywebfoundation/origin/commit/a66bad931a8c59c2a8d021cad546c9d4c47f7e88))
* **origin-ui-user:** add RequestResetPassword and ResetPassword pages, create LoginLayout wrapper ([0557a10](https://github.com/energywebfoundation/origin/commit/0557a101afa762ad92fd20714e3e07e7d769d47e))
* **origin-ui-user:** add self-ownership switch ([cb61aa6](https://github.com/energywebfoundation/origin/commit/cb61aa6dc0865adae57e791618a41d805d731be2))
* **origin-ui-user:** connect reset password ui to api ([cee02f9](https://github.com/energywebfoundation/origin/commit/cee02f9215b72323c78ffd988f74bd4b98df218e))
* **origin-ui-user:** move from external web3 package to native web3 package usage ([9d7de59](https://github.com/energywebfoundation/origin/commit/9d7de595a17edfaa80a08314e66dfddfdb6f571f))


### BREAKING CHANGES

* package now uses @mui/* packages instead of @material-ui/* ones
* **origin-ui-user:** UserApp now expects allowedChainIds to be supplied as env variable from the root, packages now have peerDep of origin-ui-web3 package





# 0.1.0 (2021-09-17)


### Features

* add loading state for table actions, improve actions typings ([6a77128](https://github.com/energywebfoundation/origin/commit/6a771283ae4535ca1feaa731267a7de739177af5))
* **origin-ui-user-view:** adjust blockchain part in user profile to work with new metamask HOC ([b14020d](https://github.com/energywebfoundation/origin/commit/b14020d830c5eec27a3343ea4573f14d9b77ca38))
* **origin-ui-user-view:** create package ([0565a44](https://github.com/energywebfoundation/origin/commit/0565a4449d01b3e33ff8be1080a7581c376585c9))
* **origin-ui-user:** add confirm email page ([60b68f0](https://github.com/energywebfoundation/origin/commit/60b68f0299e16370c04b8de317234e2642ae96be))
