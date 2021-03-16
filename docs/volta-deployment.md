# Volta deployment

Sometime it's more convenient to use a test network over local for testing or development. 

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    Origin SDK and it's reference implementation can be deployed to any EVM compatible blockchain.
  </p>
</div>

Origin in development mode uses `.env` file to set all necessary configuration variables, in order to use Volta network please follow these steps:

<div class="admonition attention">
  <p class="first admonition-title">Attention</p>
  <p class="last">
    Make sure you completed <a href="../getting-started">Getting started</a> in order to install and build Origin monorepo.
  </p>
</div>
  
  1. copy `.env.example` to `.env`
  2. edit `.env` and set
    - `WEB3` to `https://volta.rpc.anyblock.tools` or any other valid Volta WEB3 node
    - `DEPLOY_KEY` to a private key with funded Volta account (see notes below for instructions)
    - `EXCHANGE_ACCOUNT_DEPLOYER_PRIV` to a private key with funded Volta account (for testing you can use `DEPLOY_KEY`)
    - `EXCHANGE_WALLET_PRIV` to a private key with funded Volta account (for testing you can use `DEPLOY_KEY`)
    - `EXCHANGE_WALLET_PUB` to a address of `EXCHANGE_WALLET_PRIV`
  3. run `yarn run:origin:web3`
  4. UI will be available at [http://localhost:3000/](http://localhost:3000/)

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    You can use sites like <a href="https://vanity-eth.tk/">https://vanity-eth.tk/</a> in order to generate a private / public key pair.
  </p>
</div>
<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    Volta tokens can be requested using EWF Volta Faucet available at <a href="https://voltafaucet.energyweb.org/">https://voltafaucet.energyweb.org/</a>
  </p>
</div>