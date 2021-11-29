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

See the Ethers documentation for the Interface class [here](https://docs.ethers.io/v5/api/utils/abi/interface/)

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

4. Provides an event listener. Each time the specified event occurs, the processEven method is called with the event:

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
The [processEvent method](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L83) takes the event and retrieves the transaction receipt:

```
const receipt = await this.provider.waitForTransaction(transactionHash);
```

The receipt is used to create the [CreateDeposit Data Transfer Object (DTO)](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/dto/create-deposit.dto.ts). The event publishes a DepositDiscoveredEvent with the DTO: 

```
this.eventBus.publish(new DepositDiscoveredEvent(deposit));
```
[source](https://github.com/energywebfoundation/origin/blob/a1c3332ec263b26cbd1b89768c03328658c18226/packages/trade/exchange-io-erc1888/src/deposit-watcher/deposit-watcher.service.ts#L128)

[The event's handler in the Exchange package](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/handlers/deposit-discovered-event.handler.ts) stores the deposit in the Deposit Repostory and posts the deposited certificate for sale on the exchange. 

## withdrawal-processor
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-io-erc1888/src/withdrawal-processor) 

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
- Withdrawal a certificate from the exchange (from the organization's exchange deposit account)
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












