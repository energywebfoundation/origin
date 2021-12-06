# Exchange - @energyweb/exchange
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange)

The Exchange package is a [NestJS](https://docs.nestjs.com/) application that provides backend services to manage the Exchange's functionality (account management and buying, selling and transferring [Energy Attribute Certificates](../user-guide-glossary.md#energy-attribute-certificate) and [bundles](../user-guide-glossary.md#bundle)). 

This functionality includes:  
+ Providing API endpoints to interact with Trade features. Trade features are described in more detail [below](#exchange-entities). 
+ Creating (deploying) new [Exchange Deposit Addresses](../user-guide-glossary.md#exchange-deposit-account) on the Energy Web Chain
+ Depositing, withdrawing, transferring and retiring (claiming) certificates
+ Creating, managing and selling [Bundles](../user-guide-glossary.md#bundle)
+ Creating and managing [Demands](../user-guide-glossary.md#demand)
+ Hosting the Exchange matching engine 
+ Creating and managing [Orders](../user-guide-glossary.md#order)
+ Posting sales
+ Managing device supply
+ Trading (buying and selling EACs through the Exchange [order book](../user-guide-glossary.md#order-book))
+ Persisting concerns for the above functionalities 

## Persistence  
The Trade SDK uses a relational database for persistence with [TypeORM](https://typeorm.io/#/) as a database integration library. The application creates a repository for each entity. Entities are defined in the entity.ts files in each pod, and are marked with the @Entity decorator. (You can read more about entities in the TypeORM documentation [here](https://typeorm.io/#/entities)).

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
This NestJS applicaton is broken down into NestJS modules or 'pods' that manage different features/functionalities of the Exchange: 
- [Account](#account)
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

In general, each 'pod' or NestJS module has:  
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

### Account  
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/account)

The Account pod provides services to manage (find, deploy) [Exchange Deposit Accounts](../user-guide-glossary.md#exchange-deposit-account). 

Each organization has one Exchange Deposit Account, which is a deployed instance of the [TokenAccount smart contract](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-token-account/contracts/TokenAccount.sol). Once a user is a member of the organization, they are linked to the organization's exchange deposit address.

#### Persistence
The user id and their associated blockchain address are persisted in the Account repository. You can view the Account entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/account/account.entity.ts). 
```
 const address = await this.accountDeployerService.deployAccount();
 
    await this.repository.save({ userId, address });
```
#### Reference Implentation
User Guides on Exchange Deposit Account:
- [Accounts and User Management: Connecting to the Blockchain](../user-guide-reg-onboarding.md#exchange-deposit-address)


### Asset
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/asset)

[Assets](../user-guide-glossary.md#asset) represent [Energy Attribute Certificates](../user-guide-glossary.md#energy-attribute-certificate) that are active (tradeable) on the exchange. Every asset is tied to one specific device and a specific generation time frame. The Asset pod provides services to fetch and create assets.

#### Persistence
Assets are persisted in the Asset repository.  Because each assest represents an on-chain EAC, each asset has a blockchain address. It also has a tokenId that from the certificate that was granted by the issuing body. You can view the Asset entity [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/asset/asset.entity.ts). 

```
   private async create(asset: CreateAssetDTO, transaction: EntityManager) {
        const repository = transaction.getRepository<Asset>(Asset);
        let existingAsset = await repository.findOne(null, {
            where: {
                address: asset.address,
                tokenId: asset.tokenId
            }
        });

        if (!existingAsset) {
            this.logger.debug(`Asset does not exist. Creating.`);
            existingAsset = await repository.save(asset);
        }

        this.logger.debug(`Returning asset ${JSON.stringify(existingAsset)}`);

        return existingAsset;
    }
```    
### Bundle 
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/bundle)

Bundles are products that are compiled from a number of different EACs that are offered to buyers as one entity. You can read more about bundles in the glossary [here](../user-guide-glossary.md#bundle).  The Bundle pod provides services for:  

+ CRUD operations for a user’s bundles (creating, retrieving, updating, cancelling)  
+ Trading (buying/trading) bundles on the exchange  

#### Persistence  
There are two repositories pertaining to bundles:  
1. **Bundle Repository:** Persists information related to a bundle (creating, cancelling, updating status of bundles). S
2. **Bundle Trade Repository:** Persists information related to bundle trade (buying and selling). Remember that bundles are not sold via the order book on the exchange; they must be purchased directly. 

#### Reference Implentation
User Guides on bundles:    
- [Exchange: All Bundles](../exchange-guides/all-bundles.md)
- [Exchange: Create Bundle](../exchange-guides/create-bundle.md)
- [Exchange: My Bundles](../exchange-guides/my-bundles.md)

### Demand
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/demand)

Demands are automatically recurring bids. By creating a demand, buyers tell the system to automatically create a [bid](../user-guide-glossary.md#bid) with the same criteria once every defined time period. You can read more about demands in the glossary [here](../user-guide-glossary.md#demand). 

The Demand pod provides services for managing (fetching, creating, updating, pausing, resuming, cancelling) demands. 

#### Persistence 
Demands are persisted in the Demand repository. You can view the Demand entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/demand/demand.entity.ts).

#### Reference Implentation
User Guides on demands:  
- [Exchange - Market: Create Demand](../exchange-guides/view-market.md#repeated-purchase)
- [Exchange - My Orders: View/Update Demands](../exchange-guides/my-orders.md#demands)

### Matching Engine Service
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/matching-engine)  

The matching engine service initializes the [Matching Engine](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts) from the @energyweb/exchange-core module and sends order submissions, queries and cancellations to the Matching Engine. The Matching Engine is initialized with the price strategy, which is set in the configuration file. There are two price strategies:  

  1. Ask Price Strategy (default): Orders are bought at the defined Ask price
  2. Order Creation Time Pick Strategy: If the bid price was created first, use the bid price. Otherwise, use the ask price: 

#### Reference Implentation
User Guides on order matching:
- [Exchange - Market: Trading View](../exchange-guides/view-market.md#trading-view)

### Order
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/order)  

‘Orders’ can be either a sell offer (ask) or a buy offer (bid). Read more about orders in the glossary [here](../user-guide-glossary.md#order). The Order pod provides services that manage:  

+ Creating [bids](../user-guide-glossary.md#bid)
+ Creating [asks](../user-guide-glossary.md#ask)
+ Creating direct buys
+ Fetching, cancelling, updating, reactivating [orders](../user-guide-glossary.md#order)  

#### Persistence 
Orders are persisted in the Order repository. You can view the Order entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/order/order.entity.ts).  

### Post for Sale
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/post-for-sale)  

The Post for Sale pod handles posting a device’s certificate hours for sale on the exchange using the Order service (from the [Order pod](#order)). The user must specify the price, the volume, the amount of energy hours and the asset Id. This information is used to create an ask, that is then posted on the exchange . 

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

The Supply pod manages the fetching, creating, updating and removing of a user’s supply. A supply is an automated creation of an “ask” or a sell of certificate hours for a given device. Whenever a device is issued a certificate by the issuing body, this service creates an automatic ask at a designated price per unit, so there is no need to manually create an ask each time a certificate is issued. 

There is one supply entity per device, which can either be in a state of ‘active’ or ‘paused’. The price of the supply can be updated. 

#### Persistence 
Supplies are persisted in the Supply repository. You can view the Supply entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/supply/supply.entity.ts).

#### Reference Implentation
User Guides on Supply:
- [Exchange - Supply](../exchange-guides/supply.md)


### Trade
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/trade) 

The Trade pod manages the fetching and persisting of trades, and updating the corresponding orders. A trade occurs when an ask and bid match. You can view a comprehensive overview of trade logic and scenarios [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/1135378481/Create+a+Trade). 
The trade service uses the NestJS EventBus class to publish events related to emit trade events. 

#### Persistence 
Trades are persisted in the Trade repository. You can view the Trade entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/trade/trade.entity.ts.

### Transfer 
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange/src/pods/transfer) 

The Transfer pod handles:  

+ Depositing certificates onto the Exchange. Once deposited onto the exchange, a certificate becomes an [Asset](../user-guide-glossary.md#asset).  
+ Withdrawing certificates from the Exchange (into the user's Blockchain Inbox)
+ Claiming (retiring) certificate(s)
+ Transfering certificate(s) to another address  

#### Persistence 
Transfers are persisted in the Transfer repository. Each entity stores the blockchain address of the certificate, and the [Transfer Direction](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/transfer-direction.ts), which denotes whether the transfer is a deposit, withdrawal, claim, or is being sent to another blockchain address. You can view the Transfer entity model [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/transfer/transfer.entity.ts).




























