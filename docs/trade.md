# Trade SDK
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade)

## Overview
The Trade SDK is responsible for enabling an [order book](./user-guide-glossary.md#order-book) style exchange for [Energy Attribute Certificates](./user-guide-glossary.md#energy-attribute-certificates). It is designed to support different types and standards of EACs, and matching scenarios and criteria. This SDK integrates with the [Traceability SDK](./traceability.md) to allow for trading of Energy Attribute Certificates on the blockchain.  

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    For in-depth information on how order book style exchange works in the context of RECs trading please refer to <a href="https://energyweb.atlassian.net/wiki/spaces/OD/pages/1138884622/Exchange+Module">https://energyweb.atlassian.net/wiki/spaces/OD/pages/1138884622/Exchange+Module</a>
  </p>
</div>

## Trade SDK Packages  
The Trade SDK has four core packages:

### 1. [Exchange Core - @energyweb/exchange-core](./trade/exchange-core.md)
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-core) 

**The Exchange Core package contains the implementation of the Exchange's [order book](./user-guide-glossary.md#order-book)-based matching engine.** The Exchange package submits bids and asks to the Matching Engine, which checks for matches against existing orders in the order book, and executes trades. It also handles [direct buys](./user-guide-glossary.md#direct-buy).  

See the full documentation for this package [here](./trade/exchange-core.md). 

### [2. Exchange - @energyweb/exchange](./trade/exchange.md)  
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange) 

The Exchange package is a [NestJS](https://docs.nestjs.com/) application that **provides backend services to manage the Exchange's functionality (account management and buying, selling and transferring [Energy Attribute Certificates](../user-guide-glossary.md#energy-attribute-certificate) and [bundles](../user-guide-glossary.md#bundle))**.  

See the full documentation for this package [here](./trade/exchange.md).

### 3. [Exchange Token Account - @energyweb/exchange-token-account](./trade/exchange-token-account.md)
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-token-account)  

This package **provides the smart contract for Exchange Deposit accounts using [the ERC-1888 Certificate standard](https://github.com/ethereum/EIPs/issues/1888)**. (You can read more about ERC-1888 Certificate standard in the context of Origin [here](./traceability.md#energy-attribute-certificates-on-the-blockchain))

See the full documentation for this package [here](./trade/exchange-token-account.md). 

### 4. [Exchange IO ERC1888 - @energyweb/exchange-io-erc1888](./trade/exchange-io-erc1888.md)  
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-io-erc1888)  

By design, The Trade SDK allows different type of assets to be used for trading. The @energyweb/exchange-io-erc1888 package **monitors specifically for deposits of [ERC-1888 Certificates](https://github.com/ethereum/EIPs/issues/1888) onto the Exchange, and executes withdrawals and transfers**. (You can read more about ERC-1888 Certificate standard in the context of Origin [here](./traceability.md#energy-attribute-certificates-on-the-blockchain)).  

See the full documentation for this package [here](./trade/exchange-io-erc1888.md).

### Additional Reading
For more context and detail on the Trade SDK:  

- ["Inside a digitalized EAC exchange for renewable energy markets" on Medium](https://medium.com/energy-web-insights/inside-a-digitalized-eac-exchange-for-renewable-energy-markets-e04f561266c3)