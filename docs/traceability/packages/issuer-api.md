# Issuer API - @energyweb/issuer-api
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api)

## Overview
The Issuer API is a [NestJS](https://nestjs.com/) package that provides restful endpoints for handling certificate operations (certificate request, issuance, transfer, claiming, revoking), and persisting certificate data. You can read more about the certificate lifecycle [here](../../traceability.md#certificate-lifecycle). 

The below gives an overview the of the package architecture, however the NestJS documentation provides further detail into the fundamentals of NestJS Architecture that may help to understand the elements of this application:  

- [Custom Providers as Services](https://docs.nestjs.com/fundamentals/custom-providers#custom-providers)
- [Dependency Injection](https://docs.nestjs.com/providers#dependency-injection)
- [CQRS (Command and Query Responsibility Segregation)](https://docs.nestjs.com/recipes/cqrs)
- [Modules](https://docs.nestjs.com/modules)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM repository design pattern](https://docs.nestjs.com/techniques/database#repository-pattern)

## Issuer API Architecture
The Issuer API package is broken down into three NestJS [modules](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods):  

+ [blockchain](#blockchain)
+ [certificate](#certificate)
+ [certification-request](#certification-request)  

Each module contains code relevant for a specific feature. In general, each NestJS module has: 

+ A [controller](https://docs.nestjs.com/controllers) that manages requests and responses to the client
+ An .entity file that maps an entity to a database repository
+ A .service file that provides methods to fetch and transform data
+ [Data Transfer Object (DTO) file(s)](https://docs.nestjs.com/controllers#request-payloads) that provide Data Transfer Objects, which are representations of the data that are exposed to the endpoint consumer  
+ A [module](https://docs.nestjs.com/modules) class that is used by NestJS to structure the application

## Persistence
The Issuer API uses [PostgreSQL](https://www.postgresql.org/) for persistence with [TypeORM](https://typeorm.io/#/) as a database integration library. The application creates a repository for each entity. Entities are defined in the .entity.ts file in each module, and are marked with the @Entity decorator. (You can read more about entities in the TypeORM documentation [here](https://typeorm.io/#/entities)). 

```
@Entity({ name: CERTIFICATION_REQUESTS_TABLE_NAME })
export class CertificationRequest extends ExtendedBaseEntity implements CertificationRequestDTO {
    @PrimaryColumn()
    id: number;

    @Column('varchar')
    owner: string;

    @Column('varchar', { nullable: false })
    energy: string;

    @Column()
    deviceId: string;
    ...
}
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certification-request/certification-request.entity.ts)

Repositories are [injected](https://docs.nestjs.com/providers#dependency-injection) into services or command handlers so they are available to use in methods:

```
@CommandHandler(ApproveCertificationRequestCommand)
export class ApproveCertificationRequestHandler
    implements ICommandHandler<ApproveCertificationRequestCommand>
{
    private readonly logger = new Logger(ApproveCertificationRequestHandler.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
    )
...
}
```
[source](https://github.com/energywebfoundation/origin/blob/f8db6c42a425225a3b91e8e3b423a7224a842a0e/packages/traceability/issuer-api/src/pods/certification-request/handlers/approve-certification-request.handler.ts#L15)

## Modules

### blockchain
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/blockchain)

The blockchain module provides services to fetch and create blockchain properties, which are needed to establish connection with the blockchain through a web3 provider, and interact with smart contracts on the blockchain. 

```
export interface IBlockchainProperties {
    web3: providers.FallbackProvider | providers.JsonRpcProvider;
    registry: RegistryExtended;
    issuer: Issuer;
    privateIssuer?: PrivateIssuer;
    activeUser?: Signer;
}
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/src/blockchain-facade/BlockchainProperties.ts)

The [BlockchainProperties entity](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.entity.ts) contains a wrap method that provides new instances of the [Registry](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/Registry.sol) and [Issuer](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/contracts/Issuer.sol) contracts with the current [Signer](https://docs.ethers.io/v5/api/signer/):  

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

The blockchain facades use the wrap method to create new instances of smart contracts when the certificate is created:

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


The blockchain properties [controller](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.controller.ts) manages requests and responses to the client. The [service](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.service.ts) provides methods to fetch and persist the blockchain property data to the repository. 

The [Data Transfer Object (DTO)](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.dto.ts) file provides a representation of the data that is exposed to the endpoint consumer of the controller methods.  

The [module file](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/blockchain/blockchain-properties.module.ts) is used by NestJS to structure the application.  

### certificate
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate)  

The certificate module provides services to manage the certificate lifecycle *after* issuance (fetch, claim, transfer, issue). It has a seperate controller and commands/command handlers for batch operations (handling multiple certificates at once).

The [certificate controller](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/certificate.controller.ts) manages requests and responses to the client. This module uses [commands](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/commands) and [command handlers](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/handlers/claim-certificate.handler.ts) to perform business logic and persist data, rather than a service provider. To do this the module uses the NestJS CQRS (Command and Query Responsibility Segregation) module. Commands are classes that take in defined parameters. Every command has a corresponding command handler that performs business logic and persistence much like a service, using the parameters from the command. You can read more about the NestJS CQRS module in their documentation [here](https://docs.nestjs.com/recipes/cqrs).  

The certificate module has commands and corresponding command handlers for each certificate (or batch certificate) operation (i.e. batch claim certificate, create certificate, get certificate, claim certificate, etc.)  
  
- [Commands](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/commands)
- [Command handlers](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/handlers)

#### On-chain Certificate Listener
[Source code on GitHub](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/listeners/on-chain-certificates.listener.ts#L66)

The OnChainCertificateWatcher class listens for events in the Registry contract (i.e. certificate creation, certificate transfer, claiming of a certificate), and publishes corresponding events for the Issuer API's [command handlers]((https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certificate/handlers)) to react to. This ensures that all events that occur on-chain are reflected in the database repositories. 

Listen for Certificate Issuance:
```
this.provider.on(
    this.registry.filters.IssuanceSingle(null, null, null),
    (event: providers.Log) => this.processEvent(BlockchainEventType.IssuanceSingle, event)
    );
```
[source](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer-api/src/pods/certificate/listeners/on-chain-certificates.listener.ts#L40)

Process the event and trigger the [CertificatesCreated event handler](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/handlers/certificates-created.handler.ts):
```
    case BlockchainEventType.IssuanceSingle:
        logEvent(BlockchainEventType.IssuanceSingle, [event._id.toNumber()]);
        this.eventBus.publish(new CertificatesCreatedEvent([event._id.toNumber()]));
        break;
```
[source](https://github.com/energywebfoundation/origin/blob/aabfee59df866348fd64c798cc2c40c241ba53d6/packages/traceability/issuer-api/src/pods/certificate/listeners/on-chain-certificates.listener.ts#L96)

### certification-request 
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/traceability/issuer-api/src/pods/certification-request) 

The certification-request module manages fetching, creating and approving certificate requests. It uses the same command handler (CQRS) pattern as the [certificate module](#certificate). 

## Certificate Persistence  
Certificate data is persisted in two locations:  

1. On the blockchain in the form of an [ERC-1888 Transferable Certificate](https://github.com/ethereum/EIPs/issues/1888). Read more about this in the Issuer documentation [here](../../traceability.md#energy-attribute-certificates-on-the-blockchain).  
2. In a relational database as a [Certificate entity](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certificate/certificate.entity.ts). Origin’s reference implementation uses [PostgreSQL](https://www.postgresql.org/), however other registries can be used according to implementation needs. 

The Issuer API uses a database to persist certificate data because it is more performant than the blockchain for data storage and data fetching. 

When a certificate is requested, issued, or updated (i.e. if it has been transferred, claimed or revoked), this is reflected in the certificate’s record in the database as well as on the blockchain. The Issuer API makes updates to the Certificates on the blockchain using the [Blockchain facade](../contracts/Issuer.md#blockchain-facade) methods, and queries the database repository using a connection through [TypeORM](https://typeorm.io/#/). 

See the code snippet below from the CreateCertificateRequestHandler class. The certificate is first created on the blockchain using the [CertificationRequest facade](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer/src/blockchain-facade/CertificationRequest.ts), and then created in the database using the repository service. 

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
[source](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certification-request/handlers/create-certification-request.handler.ts)






