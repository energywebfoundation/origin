# origin release B

## Main Changes
* New **privacy** features:
    * Moved many onchain properties to **offchain storage** 
    * Added **precise proof** functionality
* Enhanced **market** functionality:
    * Certificates can be **split**
    * Certificates support **direct purchases** with ERC20 tokens
    * **Demand, supply, agreement** structure
    * **Configurable matcher rules** 
    * **Simulation functionality** for matcher
* Improved **extensibility**:
    * Introduced the **tradable entity** abstraction layer
    * Support for **bundles**
    * Possibility to link **arbitrary offchain data** to onchain entities in a verifiable way
* Tradable entity **standard** compliance:
    * **ERC721**
    * **ERC165**
* Improved **developer experience**:
    * Facade libraries fetch, verify and provide on- and offchain data in a **single method call**
    * **Truffle compatibility**
    * **Config file validation** with JSON schema
    * Updated all contracts to **Solidity v0.5.0** or higher
    * **Test backend** for offchain storage
* **Modular structure**:
    * User Registry
    * Asset Registry 
    * Origin Issuer
    * Origin Market


## Repositories
* ew-asset-registry-contracts
* ew-asset-registry-lib
* ew-asset-registry-frontend
* ew-market-contracts
* ew-market-lib
* ew-market-matcher
* ew-origin-contracts
* ew-origin-lib
* ew-user-registry-contracts
* ew-user-lib
* ew-utils-general-contracts
* ew-utils-general-lib  
* ew-utils-general-precise-proofs
* ew-utils-demo
* ew-utils-deployment 
* ew-utils-testbackend
* ew-utils-testtoken 

## asset-registry
* created separate repositories for assets: 
    * ew-asset-registry-contracts
    * ew-asset-registry-lib
    * ew-asset-registry-frontend
### smart contracts 
* created "AssetContractLookup" Smart Contract: smart contract that stores the address of the actual logic contracts (can be used for ENS)
* refactored code, using structs for transferring information between logic and db contract
* moved onchain-properties to be stored offchain: 
    * operationalSince
    * capacityWh
    * country
    * region
    * zip 
    * street
    * houseNumber
    * gpsLatitude
    * gpsLongitude
* assets can be linked to one OriginContract, allowing him to createTradableEntities (e.g. certificates)
* without such a link only the produced energy gets tracked, no certificates will be created (only energy produced will be tracked)
* enforced rule that each smartMeter-address can be used once
* assets can be retrieved by its asstetId or by its smartMeter-address (both are working)
* each asset supports up to 10 matcher 
* created interfaces to talk to the AssetProducingRegistryLogic andAssetConsumingRegistryLogic from outside (e.g. through origin smart contracts)
* created npm-package for ew-asset-registry-contracts
    * typescript bindings for smart contracts
    * function to deploy asset-registry-contracts
    
### asset-lib    
* precise proofs are used for storing and retrieving the offchain properties
* CO2 saved is not stored anymore, gets calculated instead
* changed library functions to both support a privateKey or an address when sending a transaction
* created npm-package for ew-asset-registry-lib 

## market-registry
* created separate repositories for market: 
    * ew-market-contracts
    * ew-market-lib
### smart contracts
* created "MarketContractLookup" contract: smart contract that stores the address of the current logic contract (can be used for ENS)
* matcher is allowed to change MatcherOffChainProperties
* separated properties in on- and offchain
* changed the way agreements are working
* both supply and demand have to exists
* supply:
    * producing asset
    * only owner of assets can create supplies
    * moved details of supply to offchain
* demand:
    * amount of energy someone wants to have in a certain amount of time
    * moved details of demands to offchain
* agreement: 
    * agreement = existing supply and demand
    * both the owner of a supply (= asset-owner) and owner of a demand (= trader) have to approve an agreement before it gets activated
* created npm-package for ew-market-registry
    * typescript bindings for smart contracts
    * function to deploy market contracts

### market lib
* precise proofs are used to storing and receiving offchain properties for demand, supply and agreement
* changed library functions to both support a privateKey or an address when sending a transaction

* new offchain properties for agreements
    * start
    * end
    * price
    * currency 
    * period
    * timeFrame

* new offchain properties for matcherOffchain
    * currentWh
    * currentPeriod

* new offchain properties for demand
    * timeFrame
    * pricePerCertificateWh
    * currency
    * producingAsset (optional)
    * consumingAsset (optional)
    * locationCountry (optional)
    * locationRegion (optional)
    * assetType (optional)
    * minCO2Offset (optional)
    * otherGreenAttributes (optional)
    * typeOfPublicSupport (optional)
    * targetWhPerPeriod
    * registryCompliance (optional)
* created npm-package for ew-market-lib

## origin-registry
* created separate repositories for origin (certificate / bundle):
    * ew-origin-contracts
    * ew-origin-lib
### smart contracts
* created "OriginContractLookup" contract: smart contract that stores the address of the current logic contract (can be used for ENS)
* logging energy will create a TradableEntity
    * owner of the producing asset will be the first owner of the created entity
    * TradableEntities support up to 10 matcher
    * TradableEntity are ERC721 and ERC165 compliant
    * added ERC20-contract address and directPurchasePrice to a tradableEntity -> allows direct buying of a TradableEntity (when ERC20 token transfer is finished)
* TradableEntities can either be stand-alone TradableEntities, Certificates or CertificateEnergyBundle
* Certificates:
    * assetOwner can set a maximum amount of owner changes for certificates
    * auto-retirement of certificates when the maximum amount of owner changes is reached
    * splitting of certificates: 
        * a certificate can be split into to child certificates which will inherit its parent properties (and could be split again)
        * once a certificate is split it cannot be traded / split / retired anymore
* created npm-package for ew-market-registry
    * typescript bindings for smart contracts
    * function to deploy contracts (as certificate or bundle of certificates and energy)

### origin lib
* changed library functions to both support a privateKey or an address when sending a transaction

## user-registry
* created separate repositories for the user-registry
    * ew-user-contracts
    * ew-user-lib
### smart contracts
* created "OriginContractLookup" contract: smart contract that stores the address of the current logic contract (can be used for ENS)
* removed most of the onchain-user properties
### user lib
* adjusted user-lib to the smart contract changes

## utils
### ew-utils-general-contracts
* created repository for small contracts that are used in multiple repositories (e.g. Owned)
### ew-utils-general-lib  
* created repository for facade-functions that are used in all the specific repositories
### ew-utils-general-precise-proofs
### ew-utils-demo
* created repository for demo purpose, can be freely configured
### ew-utils-deployment 
* created repository with a deploy function for smart contracts
### ew-utils-testbackend
* created repository for a small testbackend for storing offchain-properties
### ew-utils-testtoken 
* created repository with a small ERC20 example contract





    