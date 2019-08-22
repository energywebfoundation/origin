# EW Origin UI

## Install

In order to install the UI, you have to call `npm install`.

## Start
In order to start the UI, you have to call `npm start`. The UI needs a running ethereum-client and a web3-object. 

Afterward, the webpage can be accessed with `localhost:3000/COO-CONTRACT_ADDRESS/` where `COO-CONTRACT_ADDRESS` is the address of the coo-contract. You can find the address inside `contractConfig.json` file in your demo/lib project. 

### Web3-object
In order to use the UI and Origin, you need a web3-provider. We recommend [MetaMask](https://metamask.io). Make sure your MetaMask extension is pointed to `localhost:8545`.
