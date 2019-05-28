# ew-utils-demo

This repository is used to deploy all the contracts for the Origin project of the Energy Web Foundation.

## How-to
- `npm install` - Install the dependencies
- `npm start-ganache` - Starts a local blockchain instance
- (new terminal window) `npm start-test-backend` - Starts a local backend instance
- (new terminal window) `npm start` - Deploys the contracts and the configuration in [config/demo-config.json](config/demo-config.json)

This will deploy all the contracts to a local Ganache instance and a local test backend.

## Interacting with the contracts
After they have been deployed, you can use the [EW Origin UI](https://github.com/energywebfoundation/ew-origin-ui) to interact with the contracts through a user-friendly interface.
