<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Origin UI Web3

## Installation

This package is available through the npm registry.

```sh
npm install @energyweb/origin-ui-web3
```

```sh
yarn add @energyweb/origin-ui-web3
```

## Description

React library for managing connection to blockchain wallet. Implementation is based on [Web3Provider](https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/web3-provider.ts) from [ethers](https://www.npmjs.com/package/@ethersproject/providers) package. Web3 state provider is built with React Context and React Hooks.

Currently available wallet adapters:

- [Metamask](https://metamask.io/)

### Requirements

Please note, that this package has React 17.0.2+ as peerDependency.

## Usage

1. Wrap your application into Web3ContextProvider at the top level.

```JSX
import { Web3ContextProvider } from '@energyweb/origin-ui-web3'

const AppRoot = () => {
   return (
     <Web3ContextProvider>
       <App />
     </Web3ContextProvider>
   );
}
```

2. Get the web3 context

```JSX
import { useWeb3 } from '@energyweb/origin-ui-web3'

const Component = () => {
  const {
    connect, // async function for connecting to a wallet: (adapter: Adapter) => Promise<void>
    disconnect, // async function for disconnecting from a current wallet: () => Promise<void>
    account, // currently connected account address: string
    chainId, // current chain id: number
    web3, // Web3Provider
    isActive // indicator of active connection to a wallet: boolean
  } = useWeb3();

  return (
    ...
  )
}
```

3. Connect to a wallet you need

```JSX
import { useWeb3, MetamaskAdapter, NotAllowedChainIdError } from '@energyweb/origin-ui-web3'

const ConnectComponent = () => {
  const { connect, account } = useWeb3();

  const handleError = (error: any) => {
    if (error instanceof NotAllowedChainIdError) {
      // or some other custom error handling
      console.log('You are connecting to not allowed chain');
    }
    console.log('Some error from Metamask: ', error);
  }

  const handleConnect = async () => {
    // supply allowedChainIds: number[] as first arg
    // you can also supply custom errorHandler as second arg
    await connect(new MetamaskAdapter([1, 2], handleError))
  }

  return (
    <>
    {!account ?
       <button onClick={handleConnect}>
          Connect Metamask
       </button>
       : <span>{account}</span>
    }
    </>
  )
}
```

## Utils

For each adapter we are also supplying HOC and Errors specific to wallet adapter of which is used.

HOC:

```JSX
import { withMetamask } from '@energyweb/origin-ui-web3'

export const withMetamask(Target, Placeholder)
/* Target - is your React Component to be blocked from user view until he connects a wallet; */

// Placeholder - is a React Component blocking the view until the wallet is connected,
// typically with a Connect button and some info text.
```

Errors:

```JSX
import {
  NoEthProviderError,
  NotAllowedChainIdError,
  UserRejectedError,
  InvalidParametersError
} from '@energyweb/origin-ui-web3'
```

## Contributing Guidelines

See [contributing.md](../../../../../contributing.md)

## Questions and Support

For questions and support please use open a new [Issue](https://github.com/energywebfoundation/origin/issues).

# EW-DOS

The Energy Web Decentralized Operating System is a blockchain-based, multi-layer digital infrastructure.

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

- To learn about more about the EW-DOS tech stack and the energy-sector challenges our use cases address, see our [documentation](https://energy-web-foundation.gitbook.io/energy-web/).

For a deep-dive into the motivation and methodology behind our technical solutions, we encourage you to read our White Papers:

- [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
- [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

- [Twitter](https://twitter.com/energywebx)
- [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
- [Telegram](https://t.me/energyweb)

## License

This package is licensed under the MIT - see the [LICENSE](LICENSE) file for details

## Acknowledgement

This library was inspired by the [web3-react/core](https://github.com/NoahZinsmeister/web3-react). Kudos to the author and contributors for creating/maintaining this great project!
