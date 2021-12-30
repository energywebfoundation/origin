# Exchange Token Account - @energyweb/exchange-token-account
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-token-account)

## Overview
The Exchange Token Account module contains the [TokenAccount.sol smart contract](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/contracts/TokenAccount.sol#L17). This smart contract is used to create (deploy) an organization's [Exchange Deposit account](../user-guide-glossary.md#exchange-deposit-account) on the blockchain. **This account forwards all of an organization's [Energy Attribute Certificates (EACs)](../user-guide-glossary.md#energy-attribute-certificate) to the [Exchange wallet](../user-guide-glossary.md#exchange-wallet), which stores all EACs currently active on the Exchange.**  

See the image below of a certificate's blockchain transactions: 

1. The local issuer approves the certificate request
2. The certificate is sent to the Exchange Deposit address (Exchange Deposit account)
3. The certificate is transferred from the Exchange Deposit address to the Exchange Wallet

![exchangeForwarding](../images/exchangeForwarding.png)

When EACs are issued by the Issuing body, they are automatically deposited onto the Exchange, unless ['Full Self-Ownership'](../user-guide-reg-onboarding.md#full-self-Ownership) is set to true, in which case they are initially deposited into an organization's Blockchain account. Users can [withdraw certificates off of the exchange](./exchange-io-erc1888.md#withdrawal-processor) at any time. In doing so, the asset is moved from the [Exchange wallet](../user-guide-glossary.md#exchange-wallet) to the organization's Blockchain account. Inversely, users can at any time transfer certificates that are in their Blockchain account to their Exchange Deposit account, which forwards them to the Exchange wallet where they are active on the exchange. 

## Exchange Deposit Account Deployment and Persistence
The Exchange Token Account module [exports a Token Account factory](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/src/index.ts) that is used to deploy new instances of the Token Account. An Exchange Deposit Account is deployed by the application once for each Organization. The factory method is used in the Exchange module's Account Deployer Service to deploy new accounts.  

The 'wallet' used to initialize the TokenAccountFactory is the private key used for exchange accounts deployment. This should be set in the .env file.  

The 'walletAddress' used as a parameter in the 'deploy' method is the public key of the Exchange wallet. This should be set in the .env file. 
```
const account = await new factory.TokenAccountFactory(wallet).deploy(walletAddress);

```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange/src/pods/account-deployer/account-deployer.service.ts#L23)

The address of the deployed account is stored in the Account Repository with the owner's userId:
```
const address = await this.accountDeployerService.deployAccount();

await this.repository.save({ userId, address });
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange/src/pods/account/account.service.ts#L54)

## Receving and Forwarding Tokens to the Exchange Wallet
The wallet address that is used to deploy the ExchangeTokenAccount contract (see above) is the address (public key) of the [Exchange wallet](../user-guide-glossary.md#exchange-wallet). 

When ERC-1155 tokens are deposited to the Exchange Deposit account, the Token Account smart contract forwards them to the Exchange wallet using the safeTransferFrom method: 
```
    function onERC1155Received(
        address operator, // Needed for the interface, but unused because it's irrelevant for our use case
        address from, // Needed for the interface, but unused because it's irrelevant for our use case
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override nonReentrant returns (bytes4) {
        IERC1155(msg.sender).safeTransferFrom(address(this), wallet, id, value, data);

        return ERC1155_ACCEPTED;
    }
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange-token-account/contracts/TokenAccount.sol#L17)

The Exchange wallet holds all EACs that are active on the Exchange. 







