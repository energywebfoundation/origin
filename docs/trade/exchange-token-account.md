# Exchange Token Account - @energyweb/exchange-token-account
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-token-account)

The Exchange Token Account module contains the [TokenAccount.sol smart contract](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/contracts/TokenAccount.sol#L17). This smart contract is used to create (deploy) an organization's [Exchange Deposit account](../user-guide-glossary.md#exchange-deposit-account) on the blockchain. **This account stores all of an organization's [Energy Attribute Certificates (EACs)](../user-guide-glossary.md#energy-attribute-certificate) that are currently traded on the exchange.**  

When EACs are issued by the Issuing body, they are automatically deposited onto the exchange. Users can [withdraw certificates off of the exchange](./exchange-io-erc1888.md#withdrawal-processor) at any time. This means that the asset is moved from the Exchange Deposit account to the users Blockchain account. Inversely, users can transfer any certificates that are in their Blockchain account into their Exchange Deposit account to make them active on the exchange at any time. 

## Exchange Deposit Account Deployment
The Exchange Token Account module [exports a Token Account factory](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/src/index.ts) that can be used to deploy new instances of the Token Account. The factory method is used in the Exchange module's Account Deployer Service to deploy new accounts. The TokenAccountFactory is initialized with the wallet 
```
const account = await new factory.TokenAccountFactory(wallet).deploy(walletAddress);

```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange/src/pods/account-deployer/account-deployer.service.ts#L23)

The address of the deployed account is stored in the Account Repository with the owner's userId:
```
const address = await this.accountDeployerService.deployAccount();

await this.repository.save({ userId, address });
```
[soucre](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange/src/pods/account/account.service.ts#L54)

## Receving and Forwarding Tokens to the Exchange 'Hot Wallet'
The wallet address that is used to deploy the ExchangeTokenAccount contract (see above) is the address of the Exchange's hot wallet. 

When ERC-1155 tokens are deposited to the Exchange Deposit account, the Token Account smart contract forwards them to the Exchange's hot wallet using the safeTransferFrom method: 
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








