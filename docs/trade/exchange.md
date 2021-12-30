# Exchange - @energyweb/exchange
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange)

## Overview
The Exchange package is a [NestJS](https://docs.nestjs.com/) application that provides backend services to manage the Exchange's functionality (account management and buying, selling and transferring [Energy Attribute Certificates](../user-guide-glossary.md#energy-attribute-certificate) and [bundles](../user-guide-glossary.md#bundle) through an order book system). 

## Persistence  
The Trade SDK uses [PostgreSQL](https://www.postgresql.org/) for persistence with [TypeORM](https://typeorm.io/#/) as a database integration library. The application creates a repository for each entity. Entities are defined in the entity.ts files in each module, and are marked with the @Entity decorator. (You can read more about entities in the TypeORM documentation [here](https://typeorm.io/#/entities)).

```
@Entity({ name: `${DB_TABLE_PREFIX}_account` })
export class Account extends ExtendedBaseEntity {
   @ApiProperty({ type: String })
   @PrimaryGeneratedColumn('uuid')
   id: string;
 
   @ApiProperty({ type: String })
   @Column()
   @IsString()
   userId: string;
 
   @ApiProperty({ type: String })
   @Column()
   @IsString()
   address: string;
}
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account/account.entity.ts) 

Repositories are [injected](https://docs.nestjs.com/providers#dependency-injection) into services or command handlers so they are available to use in methods: 

```
import { Account } from './account.entity';
@Injectable()
export class AccountService {
   private readonly logger = new Logger(AccountService.name);
 
   private readonly requestQueue = new Subject<string>();
 
   constructor(
       @InjectRepository(Account)
       private readonly repository: Repository<Account>,
       private readonly connection: Connection,
       private readonly accountDeployerService: AccountDeployerService
   ) {
       this.requestQueue.pipe(concatMap((id) => this.process(id))).subscribe();
   }
``` 
[source](https://github.com/energywebfoundation/origin/blob/f8db6c42a425225a3b91e8e3b423a7224a842a0e/packages/trade/exchange/src/pods/account/account.service.ts#L19)  

 
You can read more about dependency injection in NestJS [here](https://docs.nestjs.com/providers#dependency-injection). You can read more about using the repository design pattern with TypeORM in NestJS applications [here](https://docs.nestjs.com/recipes/sql-typeorm). 

## Exchange Architecture
This NestJS applicaton is broken down into NestJS modules that manage Exchange functionalities:  

- [Account](#account)
- [Account Balance](#account-balance)
- [Asset](#asset)
- [Bundle](#bundle)
- [Demand](#demand)
- [Matching Engine Service](#matching-engine-service)
- [Order](#order)
- [Order Book](#order-book)
- [Post-for-sale](#post-for-sale)
- [Supply](#supply)
- [Trade](#trade)
- [Transfer](#transfer)

Each module contains code relevant for a specific feature. In general, each NestJS module has:  

  + A [controller](https://docs.nestjs.com/controllers) that manages requests and responses to the client
  + A .entity file that maps an entity to a database repository
  + A .service file that provides methods to fetch and transform data
  + [Data Transfer Object (DTO) file(s)](https://docs.nestjs.com/controllers#request-payloads) that provide Data Transfer Objects, which are representations of the data that are exposed to the endpoint consumer  
  + A [module](https://docs.nestjs.com/modules) class that is used by NestJS to structure the application

The below gives an overview the of the package architecture, however the NestJS documentation provides further detail into the fundamentals of NestJS Architecture and [TypeORM](https://typeorm.io/#/) integration that may help to understand the elements of this application:  

- [Custom Providers as Services](https://docs.nestjs.com/fundamentals/custom-providers#custom-providers)
- [Dependency Injection](https://docs.nestjs.com/providers#dependency-injection)
- [CQRS module](https://docs.nestjs.com/recipes/cqrs)
- [Modules](https://docs.nestjs.com/modules)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM repository design pattern](https://docs.nestjs.com/techniques/database#repository-pattern)


## Modules 

### Account  
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/account)

The Account module provides services to manage (find, deploy) [Exchange Deposit Accounts](../user-guide-glossary.md#exchange-deposit-account). 

Each organization has one Exchange Deposit Account, which is a deployed instance of the [TokenAccount smart contract](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/contracts/TokenAccount.sol). Once a user is a member of the organization, they are linked to the organization's exchange deposit address.

The user id and the address of the Exchange Deposit Account are persisted in the Account repository. You can view the Account entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account/account.entity.ts). 
```
 const address = await this.accountDeployerService.deployAccount();
 
    await this.repository.save({ userId, address });
```
#### Reference Implentation
User Guides on Exchange Deposit Account:
- [Accounts and User Management: Connecting to the Blockchain](../user-guide-reg-onboarding.md#exchange-deposit-address) 

### Account Balance
The Account Balance module has two services:

#### 1. Account Balance Service
This service provides a method to register [assets](../user-guide-glossary.md#asset) to a user:
```
    private assetSources = Array<IAccountableAsset>();

    public registerAssetSource(source: IAccountableAsset): void {
        const { name } = source.constructor;

        this.logger.debug(`Registering asset source: ${name}`);

        if (this.assetSources.find((i) => i.constructor.name === name)) {
            this.logger.debug('Asset source already registered');
            return;
        }

        this.assetSources.push(source);
    }
```
[source](https://github.com/energywebfoundation/origin/blob/fe7af8709103f37240253dd0b517f97099447831/packages/trade/exchange/src/pods/account-balance/account-balance.service.ts#L15)

The remaining methods in the class use the assetSources Array to calculate a user's available and locked assets, and to return their current asset amounts. 

#### 2. Account Balance Asset Service
This service returns a users locked and available assets. **This class is the base for all of the Accounting Services in the Exchange's modules.** 

### Asset
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/asset)

[Assets](../user-guide-glossary.md#asset) represent [Energy Attribute Certificates](../user-guide-glossary.md#energy-attribute-certificate) that are active (tradeable) on the exchange. Every asset is tied to one specific device and a specific generation time frame. The Asset module provides services to fetch and create assets.

Assets are persisted in the Asset repository.  Because each assest represents an on-chain EAC, each asset has a blockchain address. It also has a tokenId that originates from the certificate that was granted by the issuing body. You can view the Asset entity [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/asset/asset.entity.ts). 
 
### Bundle 
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/bundle)

Bundles are products that are compiled from a number of different EACs that are offered to buyers as one entity. You can read more about bundles in the glossary [here](../user-guide-glossary.md#bundle).  The Bundle module provides services for:  

+ CRUD operations for a user’s bundles (creating, retrieving, updating, cancelling)  
+ Trading (buying/trading) bundles on the exchange  

There are two repositories pertaining to bundles:  

1. **Bundle Repository:** Persists information related to a bundle (creating, cancelling, updating status of bundles). 
2. **Bundle Trade Repository:** Persists information related to *bundle trade* (buying and selling). Remember that bundles are not sold via the order book on the exchange; they must be purchased directly. 

#### Bundle Accounting Service
The [Bundle Accounting Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/bundle/bundle-accounting.service.ts) extends the [Account Balance Asset Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account-balance/account-balance-asset.service.ts). The public methods return the locked and available bundle assets for an owner. 

#### Reference Implentation
User Guides on bundles:  

- [Exchange: All Bundles](../exchange-guides/all-bundles.md)
- [Exchange: Create Bundle](../exchange-guides/create-bundle.md)
- [Exchange: My Bundles](../exchange-guides/my-bundles.md)

### Demand
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/demand)

Demands are automatically recurring bids. By creating a demand, buyers tell the system to automatically create a [bid](../user-guide-glossary.md#bid) with the same criteria once every defined time period. You can read more about demands in the glossary [here](../user-guide-glossary.md#demand). 

The Demand module provides services for managing (fetching, creating, updating, pausing, resuming, cancelling) demands. 

#### Reference Implentation
User Guides on demands:  

- [Exchange - Market: Create Demand](../exchange-guides/view-market.md#repeated-purchase)
- [Exchange - My Orders: View/Update Demands](../exchange-guides/my-orders.md#demands)

### Matching Engine Service
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/matching-engine)  

The matching engine service initializes the [Matching Engine](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts) from the @energyweb/exchange-core module and sends order submissions, queries and cancellations to the Matching Engine.  


The Matching Engine is initialized with the price strategy, which is set in the configuration file. There are two price strategies:  

  1. **Ask Price Strategy** (default): Orders are bought at the defined Ask price
  2. **Order Creation Time Pick Strategy**: If the bid price was created first, use the bid price. Otherwise, use the ask price: 

#### Reference Implentation
User Guides on order matching:
- [Exchange - Market: Trading View](../exchange-guides/view-market.md#trading-view)

### Order
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/order)  

‘Orders’ can be either a sell offer (ask) or a buy offer (bid). Read more about orders in the glossary [here](../user-guide-glossary.md#order). The Order module provides services that manage:  

+ Creating [bids](../user-guide-glossary.md#bid)
+ Creating [asks](../user-guide-glossary.md#ask)
+ Creating direct buys
+ Fetching, cancelling, updating, reactivating [orders](../user-guide-glossary.md#order)  

#### Order Accounting Service 
The [Order Accounting Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/order/order-accounting.service.ts) extends the [Account Balance Asset Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account-balance/account-balance-asset.service.ts). The public methods retrieve active bids and asks for an owner, and then calculates the current locked and available assets for that owner. 

### Post for Sale
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/post-for-sale)  

The Post for Sale module handles posting a device’s certificate hours for sale on the exchange using the Order service (from the [Order module](#order)). The user must specify the price, the volume, the amount of energy hours and the asset Id. This information is used to create an ask, that is then posted on the exchange . 

``` 
       const ask: CreateAskDTO = {
               price: supply.price,
               validFrom: new Date(),
               volume: amount,
               assetId
           };
 
           await this.orderService.createAsk(userId, ask);
```  

### Supply
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/supply)  

The Supply module manages the fetching, creating, updating and removing of a user’s supply. A supply is an automated creation of an “ask” or a sell of certificate hours for a given device. Whenever a device is issued a certificate by the issuing body, this service creates an automatic ask at a designated price per unit, so there is no need to manually create an ask each time a certificate is issued. 

There is one supply entity per device, which can either be in a state of ‘active’ or ‘paused’. The price of the supply can be updated. 

#### Reference Implentation
User Guides on Supply:
- [Exchange - Supply](../exchange-guides/supply.md)


### Trade
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/trade) 

The Trade module manages the fetching and persisting of trades, and updating the corresponding orders. A trade occurs when an ask and bid match. You can view a comprehensive overview of trade logic and scenarios [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/1135378481/Create+a+Trade). 
The trade service uses the NestJS EventBus class to publish events related to emit trade events. 

#### Trade Accounting Service 
The [Trade Accounting Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/trade/trade-accounting.service.ts) extends the [Account Balance Asset Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account-balance/account-balance-asset.service.ts). The public method retrieves all trades for an owner, and then calculates the current available assets for that owner. 

### Transfer 
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/transfer) 

The Transfer module handles:  

+ Depositing certificates onto the Exchange. Once deposited onto the exchange, a certificate becomes an [Asset](../user-guide-glossary.md#asset).  
+ Withdrawing certificates from the Exchange (into the user's Blockchain Inbox)
+ Claiming (retiring) certificate(s) directly from the Exchange wallet
+ Transfering certificate(s) to another Exchange Deposit address  

Transfers are persisted in the Transfer repository. Each entity stores the blockchain address of the certificate, and the [Transfer Direction](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/transfer-direction.ts), which denotes whether the transfer is a deposit, withdrawal, claim, or transfer. You can view the Transfer entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/transfer.entity.ts).  

#### Transfer Accounting Service 
The [Transfer Accounting Service](link) extends the [Account Balance Asset Service](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account-balance/account-balance-asset.service.ts). The public method retrieves all transfers for an owner, and then calculates the current available assets for that owner based on the transfer directions (withdrawal, claim, send, deposit). 