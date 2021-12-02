# Issuer API
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api)

The Issuer API is a [NestJS](https://nestjs.com/) package that provides restful endpoints for handling Certificate operations (certificate request, issuance, transfer, claiming, revoking). You can read more about certificate operations [here](../../traceability.md). 

The below gives an overview the of the package architecture, however the NestJS documentation provides further detail into the fundamentals of NestJS Architecture that may help to understand the elements of this application:
- [Custom Providers as Services](https://docs.nestjs.com/fundamentals/custom-providers#custom-providers)
- [Dependency Injection](https://docs.nestjs.com/providers#dependency-injection)
- [CQRS module](https://docs.nestjs.com/recipes/cqrs)
- [Modules](https://docs.nestjs.com/modules)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM repository design pattern](https://docs.nestjs.com/techniques/database#repository-pattern)

## Issuer API Architecture

The Issuer API is broken down into [three pods](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods):   

### blockchain
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/blockchain)

The blockchain pod provides services to fetch and create blockchain properties, which are needed to establish connection with the blockchain through a web3 provider and interact with smart contracts on the blockchain. The registry, issuer and private issuer are public addresses. 
```
export interface IBlockchainProperties {
    web3: providers.FallbackProvider | providers.JsonRpcProvider;
    registry: RegistryExtended;
    issuer: Issuer;
    privateIssuer?: PrivateIssuer;
    activeUser?: Signer;
}
```
[source](link)

The [BlockchainProperties entity](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.entity.ts) contains a wrap method that provides a new instance of the Registry and Issuer contracts with the current signer:  

```
    wrap(signerOrPrivateKey?: Signer | string): IBlockchainProperties {
        const web3 = getProviderWithFallback(
            ...[this.rpcNode, this.rpcNodeFallback].filter((url) => !!url)
        );
        const assure0x = (privateKey: string) =>
            privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        let signer: Signer;

        if (signerOrPrivateKey) {
            signer =
                typeof signerOrPrivateKey === 'string'
                    ? new Wallet(assure0x(signerOrPrivateKey), web3)
                    : signerOrPrivateKey;
        } else {
            signer = new Wallet(assure0x(this.platformOperatorPrivateKey), web3);
        }

        return {
            web3,
            registry: Contracts.factories.RegistryExtendedFactory.connect(this.registry, signer),
            issuer: Contracts.factories.IssuerFactory.connect(this.issuer, signer),
            privateIssuer: this.privateIssuer
                ? Contracts.factories.PrivateIssuerFactory.connect(this.privateIssuer, signer)
                : null,
            activeUser: signer
        };
    }
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.entity.ts#L34)

The blockchain facadades use this method on the blockchain properties to create new instances of contracts:

```
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
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/traceability/issuer-api/src/pods/certificate/handlers/issue-certificate.handler.ts#L30)


The blockchain properties [controller](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.controller.ts) manages requests and responses to the client. The [service](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.service.ts) provides methods to fetch and save the blockchain property data to the repository. Blockchain properties are needed to establish the RPC connection and interact with the Certificate smart contracts on the blockchain. 

#### Persistence
Blockchain property data is persisted in the Blockchain Properties repository. The [entity file](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.entity.ts) maps the blockchain proeprty data to a strongly typed entity in the database repository. The [Data Transfer Object (DTO)](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.dto.ts) file provides a representation of the data that is exposted to the endpoint consumer of the controller methods. The [module file](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.module.ts) is used by NestJS to structure the application. 

### certificate
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate)  

The certificate pod provides services to manage the certificate lifecycle *after* issuance (fetch, claim, transfer, issue) The controller manages requests and responses to the client. Unlike the [blockchain module](#blockchain), the controller methods do not call on a service provider. This module uses [commands](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/commands) and [command handlers](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/handlers/claim-certificate.handler.ts) to perform business logic and persist data. To do this it uses the NestJS CQRS (Command and Query Responsibility Segregation) module. Commands are classes that take in defined parameters. Every command has a corresponding command handler that performs business logic and persistence much like a service, using the parameters from the command. You can read more about the NestJS CQRS module in their documentation [here](https://docs.nestjs.com/recipes/cqrs).  

The certificate pod has commands and corresponding command handlers for each certificate operation (i.e. batch claim certificate, create certificate, get certificate, claim certificate, etc.)  
- [Commands](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/commands)
- [Command handlers](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/handlers)

#### Persistence
See [below](#certificate-persistence) on certificate persistence. 

### certification-request 
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certification-request) 

The certification-request pod manages fetching, creating and approving certificate requests. It uses the same command handler (CQRS) pattern as the [certificate pod](#certificate). 

#### Persistence
Certificate requests are persisted in the Certification Request repository. You can see the Certificate Request entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certification-request/certification-request.entity.ts). The command handlers are responsible for fetching, persisting and updating data in the repository. 


## Certificate Persistence  
Certificate data is persisted in two locations:  

1. On the blockchain in the form of an ERC-1888 token. Read more about this in the Issuer documentation [here](../../traceability.md#energy-attribute-certificates-on-the-blockchain).
2. In a relational database. Origin’s reference implementation uses [PostgreSQL](https://www.postgresql.org/), however other registries can be used according to implementation needs. 

The Issuer API uses a database for certificate data because it is more performant than querying the blockchain each time data is needed.  

When a certificate is requested, issued, or updated (i.e. if it has been transferred, claimed or revoked), this is reflected in the certificate’s record in the database as well as on the blockchain. The Issuer API makes updates to the Certificates on the blockchain using the [Blockchain facade](../contracts/Issuer.md#blockchain-facade) methods, and queries the database repository using a connection through [TypeORM](https://typeorm.io/#/). 

Consider the code snippet below from the CreateCertificateRequestHandler class. The certificate is first created on the blockchain using the CertificationRequestFacade, and then created in the database using the repository service. You can see the source code [here](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certification-request/handlers/create-certification-request.handler.ts). 

```
async execute({
       fromTime,
       toTime,
       deviceId,
       to,
       energy,
       files,
       isPrivate
   }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
       if (!isAddress(to)) {
           throw new BadRequestException(
               'Invalid "to" parameter, it has to be ethereum address string'
           );
       }
 
       const blockchainProperties = await this.blockchainPropertiesService.get();

       //Create Certificate on the blockchain using the blockchain facade: 
 
       try {
           const certReq = await CertificationRequestFacade.create(
               fromTime,
               toTime,
               deviceId,
               blockchainProperties.wrap(),
               to
           );
           this.logger.debug(
               `Certification request ${certReq.id} has been deployed with id ${certReq.id} `
           );
 
        //Create instance of the Certificate in the database:

           const certificationRequest = this.repository.create({
               id: certReq.id,
               deviceId,
               energy,
               fromTime,
               toTime,
               approved: false,
               revoked: false,
               files,
               isPrivate: isPrivate ?? false,
               owner: getAddress(to)
           });
 
           return this.repository.save(certificationRequest);
       } catch (e) {
           this.logger.error(
               `Certification request creation has failed with the error: ${e.message}`
           );
```







