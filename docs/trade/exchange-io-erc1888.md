# @energyweb/exchange-io-erc1888
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-io-erc1888) 


@energyweb/exchange-io-erc1888 provides the implementation for [ERC-1888 Certificate](https://github.com/ethereum/EIPs/issues/1888) deposits onto and withdrawals from the Energy Web blockchain. You can read more about the ERC-1888 in the context of Origin [here](../traceability.md#energy-attribute-certificates-on-the-blockchain).

This package is a NestJS application that uses [ethers.js](https://docs.ethers.io/v5/) to interact with the smart contracts on blockchain. It is tightly coupled with the [Exchange module](./exchange.md). 

The package has two core NestJS modules:  
- [deposit-watcher](#deposit-watcher)
- [withdrawal-processor](#withdrawal-processor)

## deposit-watcher
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-io-erc1888/src/deposit-watcher)

The [deposit-watcher service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts) sets up a listener for deposits and emits events to the DepositDiscoveredEventHandler when they occur. 


When the deposit-watcher module initializes, The service does the following: 

1. Creates an interface of the ERC-1888 token in order to interact with the contract: 

```
private tokenInterface = new ethers.utils.Interface(Contracts.RegistryExtendedJSON.abi);
```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L21)

See the ethers.js documentation for the Interface class [here](https://docs.ethers.io/v5/api/utils/abi/interface/)

2. Initializes an RPC provider. This allows for communication with the Energy Web Chain through JSON-RPC request and response: 
```
this.provider = getProviderWithFallback(...web3ProviderUrl.split(';'));
```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L56)
3. Defines the "topic" or event that the service needs to listen for:
```
        const topics = [
            this.tokenInterface.getEventTopic(this.tokenInterface.getEvent('TransferSingle'))
        ];
```

4. Provides an event listener. Each time the specified event occurs, the processEvent method is called with the event:

```      
this.provider.on(
            {
                address: this.registryAddress,
                topics
            },
            (event: providers.Log) => this.processEvent(event)
        );
    }
```
The [processEvent method](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L83) uses the event's transaction hash to retrieve the transaction receipt:

```
const receipt = await this.provider.waitForTransaction(transactionHash);
```

The receipt is used to create the [CreateDeposit Data Transfer Object (DTO)](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/dto/create-deposit.dto.ts). Once created, the event bus publishes a DepositDiscoveredEvent with the DTO: 

```
this.eventBus.publish(new DepositDiscoveredEvent(deposit));
```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L128)

[The event's handler in the Exchange package](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/handlers/deposit-discovered-event.handler.ts) stores the deposit in the Deposit Repostory and posts the deposited certificate for sale on the exchange. 

## withdrawal-processor
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-io-erc1888/src/withdrawal-processor) 

### Withdrawing EACs from the Exchange
As long as EACs are not currently being traded on the Exchange, they can be withdrawn from the user’s [Exchange Deposit account](../user-guide-glossary.md#exchange-deposit-account). Users can choose to only withdraw parts of the EAC volume while keeping a part on the exchange. Once the certificates are withdrawn from the Exchange, the asset amounts in the user’s Exchange account are reduced accordingly.

The assets that are in the active part of the exchange user account and that can be withdrawn are calculated as follows: You get all deposits and subtract the withdrawals and all ingoing trades and subtract the outgoing trades. Now you have the EACs that are in possession of the user. But not all EACs that are in the user’s possession can be withdrawn. All EACs that have been published for sale in an ask are locked to ensure that they can be directly sent to the buyer once a match is made. This means that the EACs that are currently in an active ask have to be subtracted from all the EACs in the user’s possession to get to the active, withdrawable part of the exchange user account. Inversely, all EACs locked in active asks represent the locked part of the exchange user account which cannot be withdrawn. 

Organizations can define any blockchain address to release the tokens to their withdrawal requests. In the user interface, this is known as the [Blockchain Account Address](../user-guide-reg-onboarding.md#organization-blockchain-account-address). If successful, the EAC tokens are transferred from the Exchange's wallet to this blockchain address. The EAC is now no longer in the custody of the Exchange operator but is owned by the user on-chain. The same EACs now would have to be re-deposited to be traded on the Exchange again.

In the application, withdrawals are initiated from the [WithdrawalRequestedEventHandler](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-io-erc1888/src/withdrawal-processor/withdrawal-requested-event.handler.ts) and [ClaimRequestedEventHandler](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-io-erc1888/src/withdrawal-processor/claim-requested-event.handler.ts). Both of these even handlers are triggered from events in the [Exchange module's transfer service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/transfer.service.ts) (WithdrawalRequestedEvent and ClaimRequestedEvent).

The withdrawal processor uses the [Certificate facade](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/src/blockchain-facade/Certificate.ts) to access and interact with the certificate on the blockchain: 
```
  const certificate = await new Certificate(
    Number(transfer.asset.tokenId),
    this.blockchainProperties
    ).sync();
```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/withdrawal-processor/withdrawal-processor.service.ts#L138)

The transfer request is piped through the transfer queue, which is facilitated by [RxJs Subject Observables](https://rxjs.dev/guide/subject)


Depending on the transfer's direction, the service uses the methods from the Certificate facade to:
- Withdrawal a certificate from the exchange (from the organization's exchange deposit account) to the organization's Blockchain Acount Address
- Transfer a certificate to another blockchain address
- Claim (retire) a certificate

```
        try {
            const certificate = await new Certificate(
                Number(transfer.asset.tokenId),
                this.blockchainProperties
            ).sync();

            if (
                transfer.direction === TransferDirection.Withdrawal ||
                transfer.direction === TransferDirection.Send
            ) {
                result = await certificate.transfer(
                    transfer.address,
                    BigNumber.from(transfer.amount)
                );
            } else if (transfer.direction === TransferDirection.Claim) {
                result = await certificate.claim(
                    {
                        beneficiary: transfer.address,
                        location: '',
                        countryCode: '',
                        periodStartDate: '',
                        periodEndDate: '',
                        purpose: 'GHG Accounting'
                    },
                    BigNumber.from(transfer.amount)
                );
            } else {
                throw Error(`Unable to process transfer with direction ${transfer.direction}.`);
            }

            await this.transferService.setAsUnconfirmed(id, result.hash);

            const receipt = await result.wait();

            await this.handleConfirmation(transfer, receipt);
        } catch (error) {
            this.logger.error(`[Transfer ${id}] Error processing transfer: ${error.message}`);
            this.logger.error(`[Transfer ${id}] Error trace: ${JSON.stringify(error)}`);
        }
```
[source]((https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/withdrawal-processor/withdrawal-processor.service.ts#L138))












