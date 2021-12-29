# Issuer - @energyweb/issuer 
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer) 

## Overview
The Issuer package contains smart contracts and interfaces that handle the management of certificates on the blockchain.

**The package has four components:**      

1. [Smart Contracts:](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer/contracts) The smart contracts for Certificate management on the blockchain. Smart contracts are documented [**below**](#smart-contracts). All smart contracts are written in [Solidity](https://docs.soliditylang.org/en/v0.8.10/).    
2. [Migrations:](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer/migrations) Methods for deploying the smart contracts to the blockchain using the [OpenZeppelin Truffle Upgrades API](https://docs.openzeppelin.com/upgrades-plugins/1.x/api-truffle-upgrades).        
3. [Blockchain-facade:](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer/src/blockchain-facade) Interfaces and strongly-typed classes with methods to interact with Issuer smart contracts. Blockchain facades are documented [below](#blockchain-facade).     
4. Utilities       
- Events
- Precise Proof Utilities  

## Components

### Smart Contracts
[**All contracts on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer/contracts)  

-   [ERC-1888](../contracts/ERC1888/ERC1888.md)  
-   [Registry](../contracts/Registry.md)  
-   [Registry Extended](../contracts/RegistryExtended.md)  
-   [Issuer](../contracts/Issuer.md)  
-   [PrivateIssuer](../contracts/PrivateIssuer.md)  

#### IERC1888  
- [**Source code on GitHub**](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/ERC1888/IERC1888.sol)  

Interface for IERC-1888 Certificate/Claim.

#### Registry
- [**Source code on GitHub**](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/Registry.sol)   
- [Full API documentation](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/)

This contract implements the ERC-1888 and ERC-1155 methods in the context of the Origin platform. You can read more about ERC-1888 and ERC-1155 [here](../../traceability.md#energy-attribute-certificates-on-the-blockchain ).

As its name suggests, the Registry contract stores and manages certificates. It handles the [issuing](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/#issueaddress-_to-bytes-_validitydata-uint256-_topic-uint256-_value-bytes-_data-uint256-id-external), [minting](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/#mintuint256-_id-address-_to-uint256-_quantity-external), [transferring](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/#safetransferandclaimfromaddress-_from-address-_to-uint256-_id-uint256-_value-bytes-_data-bytes-_claimdata-external) and [claiming](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/#safebatchtransferandclaimfromaddress-_from-address-_to-uint256-_ids-uint256-_values-bytes-_data-bytes-_claimdata-external) of certificates, and returns certificate data and [certificate owner’s claimed balances](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Registry/#claimedbalanceofaddress-_owner-uint256-_id-uint256-external) for a given certificate(s). 

Certificates are stored in the [certificateStorage map](https://github.com/energywebfoundation/origin/blob/2881ba2e04739c99eb8d6f48a53d15afe4844c3e/packages/traceability/issuer/contracts/Registry.sol#L13) in this contract, and are accessed by their Certificate Id.  

Claimed balances (the balance of units of energy claimed) are stored in the [claimedBalances map](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer/contracts/Registry.sol#L16) in this contract, and are accessed by tokenId and owner address. 

##### Claiming Certificates
To claim a certificate is to retire it, or remove it from circulation, for reporting purposes. This is the final stage in the certificate lifecyle.  

When a certificate is claimed, the [Certificate blockchain facade](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer/src/blockchain-facade/Certificate.ts) calls the safeTransferAndClaimFrom method on the [Registry contract](../contracts/Registry.md) with the certificate id, the volume to be claimed and the [claim data](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer/src/blockchain-facade/Certificate.ts#L23).  

```
        return registryWithSigner.safeTransferAndClaimFrom(
            fromAddress,
            claimAddress,
            this.id,
            amount ?? ownedVolume,
            encodedClaimData
        );
```
[source](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer/src/blockchain-facade/Certificate.ts#L287)

The user's claim balance is updated in the Registry contract, and the certificate is burned using the [ERC1155 burn method](https://docs.openzeppelin.com/contracts/3.x/api/token/erc1155#ERC1155-_burn-address-uint256-uint256-): 
```
	/// @notice Burn certificates after they've been claimed, and increase the claimed balance.
	function _burn(address _from, uint256 _id, uint256 _value) internal override {
		ERC1155._burn(_from, _id, _value);

		claimedBalances[_id][_from] = claimedBalances[_id][_from] + _value;
	}
```
[source](https://github.com/energywebfoundation/origin/blob/6c90c45a0615b18fc9b344dfae544f67c3d4cd92/packages/traceability/issuer/contracts/Registry.sol#L188)

**Once a certificate is burned, you can no longer perform operations on it** (transfer, withdraw, deposit onto exchange, etc.)

When the burn occurs, a ClaimSingle (or ClaimBatch) event is emitted. The [Issuer API's on-chain Certificate listener](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer-api/src/pods/certificate/listeners/on-chain-certificates.listener.ts#L66) processes this event by updating the certificate repository with the new claim event. This creates parity between the on-chain certificate and the representation of the certificate in the database. This data is used for claims reporting. 
```
const onChainCert = await new OnChainCertificate(
    certificate.id,
    certificate.blockchain.wrap()
    ).sync();

try {
    const updateResult = await this.repository.update(certificate.id, {
        owners: onChainCert.owners,
        claimers: onChainCert.claimers,
        claims: await onChainCert.getClaimedData()
    });
```
[source](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer-api/src/pods/certificate/handlers/sync-certificate.handler.ts#L37) 


#### RegistryExtended  
- [**Source code on GitHub** ](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/Issuer.sol)  

The methods in this contract handle batch issuance, batch transfer and batch transfer and claim for multiple _to and _from addresses. (Batch methods in the [Registry.sol](#registry) contract only support issuing and transferring certificates for one address.) 

#### Issuer

- [**Source code on GitHub**](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/Issuer.sol) 
- [Full API documentation](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Issuer/)  

This smart contract contains the methods for the **Certificate request and approval workflow** for issuing ERC-1888 Transferable Certificates, including:  

- [Requesting certification](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Issuer/#requestcertificationforbytes-_data-address-_owner-uint256-public) from the issuer    
- [Approving certification](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Issuer/#approvecertificationrequestuint256-_requestid-uint256-_value-uint256-public) requests     
- [Revoking certificate requests](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Issuer/#revokerequestuint256-_requestid-external) requests   
- [Revoking issued certificates](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/contracts/Issuer/#revokecertificateuint256-_certificateid-external)  

The Issuer smart contract is dependent on the [Registry smart contract](#registry) for issuing certificates and minting energy production values for certificates.  

When new Certificates are issued, they are stored in [Registry’s certificate storage map](https://github.com/energywebfoundation/origin/blob/645333ed50e6135159d21e6592afd2183ba13636/packages/traceability/issuer/contracts/Registry.sol#L13) and accessed by their Certificate Id. 

### Blockchain Facade
- [**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer/src/blockchain-facade)  

The Blockchain facade exposes methods that call the [public methods of the Issuer module's smart contracts](#smart-contracts). The facade methods use the [ethers.js](https://docs.ethers.io/v5/) API to interact with the smart contracts. If you are unfamiliar with how API client libraries connect to and interact with the blockchain, you can read more in our documentation [here](https://energy-web-foundation.gitbook.io/energy-web/how-tos-and-tutorials/interacting-with-a-smart-contract). 

#### Implementing Facades in the Issuer API
Facades are imported and instantiated in the [Issuer API](./issuer-api.md), where the facade's methods are called to interact with smart contracts on the blockchain. See the below implementation in the Issue Certificate Handler (source code [here](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/handlers/issue-certificate.handler.ts)).

```
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
//Import facade
import { Certificate as CertificateFacade } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IssueCertificateCommand } from '../commands/issue-certificate.command';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { UnminedCommitment } from '../unmined-commitment.entity';

@CommandHandler(IssueCertificateCommand)
export class IssueCertificateHandler implements ICommandHandler<IssueCertificateCommand> {
    constructor(
        @InjectRepository(UnminedCommitment)
        private readonly unminedCommitmentRepository: Repository<UnminedCommitment>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        isPrivate,
        metadata
    }: IssueCertificateCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        if (!isPrivate) {
            return await CertificateFacade.create(
                to,
                BigNumber.from(energy),
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                metadata
            );
        }
        //call facade method:
        const { tx, proof } = await CertificateFacade.createPrivate(
            to,
            BigNumber.from(energy),
            fromTime,
            toTime,
            deviceId,
            blockchainProperties.wrap(),
            metadata
        );

        await this.unminedCommitmentRepository.save({
            txHash: tx.hash.toLowerCase(),
            commitment: proof
        });

        return tx;
    }
}
```






