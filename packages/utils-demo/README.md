# ew-utils-demo

This repository is used to deploy all the contracts for the Origin project of the Energy Web Foundation.

## How-to
- `npm install` - Install the dependencies

Method 1
- `npm run start-ganache` - Starts a local blockchain instance
- (new terminal window) `npm run origin-backend` - Starts a local backend instance
- (new terminal window) `npm start` - Deploys the contracts and the configuration in [config/demo-config.json](config/demo-config.json)

Method 2
- `npm run start-all`- Starts all script from Method 1 using concurrently 

This will deploy all the contracts to a local Ganache instance and a local test backend.

## Interacting with the contracts
After they have been deployed, you can use the [EW Origin UI](https://github.com/energywebfoundation/ew-origin-ui) to interact with the contracts through a user-friendly interface.

## Introduction

This repo is for demonstration purposes and to show how the certificate of origin can work. This repo will:
* deploy and setup all required smart contracts with the provided private key
* onboard users, consuming- and producing assets
* set meterreading of both consuming- and producing assets
* trade certificates through transferring ownership and/or buying through ERC20 test tokens
* split certificates
* create demands, supplies and agreements

Currently the repo will <b>not</b> start the ui. You still have to do this by yourself.

After you clone this repo you have to run the command <code>npm install</code>. It will install all the required dependencies.

When the command is finished you have to start a blockchain:
* ganache / testrpc: to run this testchain simply run the command <code>npm run start-ganache</code>
* your own blockchain client connected to any ethereum-like chain (e.g. Tobalaba)

This demo is using raw-transactions, so you don't have to unlock your accounts in the blockchain-client. Because this demo was developed with Tobalaba in mind the current gasPrice is set to 0 thus enabling sending transaction from accounts without any balance.<br>
Currently the demo is configured to use the port <code>8545</code>. In case you're using your own client please make sure that the client is listening to that port. <br>

Apart from starting a blockchain you must also start a test backend server using the command <code>npm run origin-backend</code>. This is because, with release B some of the non-vital data is stored off chain on a server. Hence the deployment of test backend is necessary for demo purposes.<br>

We strongly recommend to change the keys included in this repo when running on a public chain (see configuration)

## Configuration

The configuration and flow of actions is done "by default" with the file [demo-config.json](config/demo-config.json) in the config-folder.

*NOTE: you could also pass a customized demo file into the <code>marketDemo()</code> function in the test script(<code>/src/test.ts</code>)*

The following keys are required:
* flow: an array with flow actions. They will get executed in the ordering within the config-file

### flow actions

Every flowaction has two entries:
* <code>type</code>: the action type
* <code>data</code>: the corresponding data for the action type

Currently the following action types are supported:
* APPROVE_CERTIFICATION_REQUEST
* CREATE_ACCOUNT
* CREATE_CONSUMING_ASSET
* CREATE_PRODUCING_ASSET
* SAVE_SMARTMETER_READ_PRODUCING
* SAVE_SMARTMETER_READ_CONSUMING
* SEND_ERC20_TOKENS_TO
* TRANSFER_CERTIFICATE
* SPLIT_CERTIFICATE
* PUBLISH_CERTIFICATE_FOR_SALE
* PUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN
* REQUEST_CERTIFICATES
* UNPUBLISH_CERTIFICATE_FROM_SALE
* BUY_CERTIFICATE
* BUY_CERTIFICATE_BULK
* CREATE_DEMAND
* CREATE_SUPPLY
* MAKE_AGREEMENT
* APPROVE_AGREEMENT

### APPROVE_CERTIFICATION_REQUEST
usage: command to approve certification requests, it creates certificates
<br>params:
* <code>certificationRequestIndex</code>: index of certification request to be approved
* <code>issuer</code>: address of issuer
* <code>issuerPK</code>: private key of issuer

#### example
<code>
{
    "type": "APPROVE_CERTIFICATION_REQUEST",
    "data": {
        "certificationRequestIndex": 0,
        "issuer": "0xcea1c413a570654fa85e78f7c17b755563fec5a5",
        "issuerPK": "0x5c0b28bff67916a879953c50b25c73827ae0b777a2ad13abba2e4b67f843294e"
    }
}
</code>

#### CREATE_ACCOUNT
usage: command to onboard a new user <br>
params:
* <code>firstName</code>: the first name of a user
* <code>surname</code>: the surname of a user
* <code>email</code>: the email of a user
* <code>organization</code>: the organization of a user
* <code>street</code> the streetname of the organization
* <code>number</code> the housenumber of the organization
* <code>zip</code> the zipcode of the organization
* <code>city</code> the city of the organization,
* <code>country</code> the country of the organization
* <code>state</code> the state of the organization
* <code>address</code> the ethereum address of the user
* <code>privateKey</code> the corresponding private key of an
* <code>rights</code> the bitmask with rights

#### example:
Onboard the user <code>John Doe</code> working for the <code>UserAdmin Organization</code> which is located in <code>Main Street 1, 01234 Anytown, anstate, USA</code>

<code>
{
    "type": "CREATE_ACCOUNT",
    "data": {
        "firstName": "John",
        "surname": "Doe",
        "email": "useradmin@example.com",
        "organization": "UserAdmin Organization",
        "street": "Main Street",
        "number": "1",
        "zip": "01234",
        "city": "Anytown",
        "country": "USA",
        "state": " anystate",
        "address": "0x71c31ff1faa17b1cb5189fd845e0cca650d215d3",
        "privateKey:" "0xbfb423a193614c6712efd02951289192c20d70b3fc8a8b7cdee7360ead486",
        "rights": 1
    }
}
</code>

### CREATE_CONSUMING_ASSET
usage: command to onboard a new consuming asset
<br>params:
* <code>smartMeter</code>: ethereum address of the used smart meter
* <code>smartMeterPK</code>: the private Key of the smart meter (needed for simulating meterreadings)
* <code>owner</code>: the owner of an asset (has to have the asset manager rights)
* <code>operationalSince</code>: the unix-timestamp when the asset went into operation mode
* <code>capacityWh</code>: maximal capcity of an asset
* <code>lastSmartMeterReadWh</code>: the last meterreading, should be 0
* <code>active</code>: flag if the the asset is active
* <code>lastSmartMeterReadFileHash</code>: the last filehash
* <code>country</code>: the country where the asset is located
* <code>region</code>: the region where the asset is located
* <code>zip</code>: the zipcode of the city where the asset is located
* <code>city</code>: the city where the asset is located
* <code>street</code>: the street where the asset is located
* <code>houseNumber</code>: the housenumber of the asset as string
* <code>gpsLatitude</code>: the latitude of the asset as string
* <code>gpsLongitude</code>: the longitude of the asset as string
* <code>timezone</code>: the timezone of the asset as string

#### example
Onboard a new consuming asset for the owner <code>0x33496f621350cea01b18ea5b5c43c6c233c3f72d (John Doe Four of the AssetManager Organization)
</code>. The asset has a smart meter connected with the ethereum account <code>0x1112ec367b20d2bffd40ee11523c3d36d61adf1b</code>. We're also passing the private key <code>50764e302e4ed8ce624003deca642c03ce06934fe77585175c5576723f084d4c</code> of that smart meter because we want to log new data within the demonstration.<br>
The smart meter is active since 06/28/2018 (<code>1529971200</code>), has the capactiy of <code>5000</code> and is active. Because we're freshly deploying that asset, it does not have a meterreading thus no need for a filehash. <br>
The asset is located in <code>Main Street 11, 01234 Anytown, AnyState, USA</code>. If you're passing the some GPS coordinates, you will see the location of the asset within the webapplication in the consuming asset detail view.

<code>
{
    "type": "CREATE_CONSUMING_ASSET",
    "data": {
        "smartMeter": "0x1112ec367b20d2bffd40ee11523c3d36d61adf1b",
        "smartMeterPK": "50764e302e4ed8ce624003deca642c03ce06934fe77585175c5576723f084d4c",
        "owner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "operationalSince": "1529971200",
        "capacityWh": 5000,
        "lastSmartMeterReadWh": 0,
        "active": true,
        "lastSmartMeterReadFileHash": "",
        "country": "USA",
        "region": "AnyState",
        "zip": "01234",
        "city": "Anytown",
        "street": "Main Street",
        "houseNumber": "11",
        "gpsLatitude": "0",
        "gpsLongitude": "0",
        "timezone": "America/Los_Angeles"
    }
}
</code>

### CREATE_PRODUCING_ASSET
usage: command to onboard a new producing asset
<br>params:
* <code>smartMeter</code>: ethereum address of the smart meter
* <code>smartMeterPK</code>: private key of the ethereum address (needed to simuate meterreading)
* <code>owner</code>: ethereum address of the owner of the asset, has to have to asset manager rights
* <code>operationalSince</code>: UNIX-timestamp when the asset entered service
* <code>capacityWh</code>: capacity of the asset
* <code>lastSmartMeterReadWh</code>: last meterreading in Wh
* <code>active</code>: flag if the asset is enabled
* <code>lastSmartMeterReadFileHash</code>: last filehash
* <code>country</code>: country where the asset is located
* <code>region</code>: region where the asset is located
* <code>zip</code>: zipcode of the city where the asset is located
* <code>city</code>: city where the asset is located
* <code>street</code>: street where the asset is located
* <code>houseNumber</code>: housenumber where the asset is located as string
* <code>gpsLatitude</code>: latitude of the asset as string
* <code>gpsLongitude</code>: longitude of the asset as string
* <code>timezone</code>: timezone of the asset as string
* <code>assetType</code>: Type of asset as string (Wind,
    Solar,
    RunRiverHydro,
    BiomassGas)
* <code>cO2UsedForCertificate</code>: amount of CO2 already used for certificates
* <code>complianceRegistry</code>: complaince as string (none,
    IREC,
    EEC,
    TIGR)
* <code>otherGreenAttributes</code>: green attributes as string
* <code>typeOfPublicSupport</code>: type of public support as string

#### example
Onboard a new energy producing asset for the owner <code>0x33496f621350cea01b18ea5b5c43c6c233c3f72d (John Doe Four of the AssetManager Organization)
</code>. The asset has a smart meter connected with the ethereum account <code>0x1112ec367b20d2bffd40ee11523c3d36d61adf1b</code>. We're also passing the private key <code>50764e302e4ed8ce624003deca642c03ce06934fe77585175c5576723f084d4c</code> of that smart meter because we want to log new data within the demonstration.<br>
The asset has a capacity of <code>10000</code> Wh and went into producition on <code>01/01/2018 (1514764800)</code>. It's some kind of BiomassGas-powerplant and is compliant to TIGR. In addition, it has the green Attributes of <code>N.A.</code> and also the <code>N.A.</code> type of public support. Because we're freshly deploying that asset, it does not have a meterreading thus no need for a filehash. <br>
The asset is located in <code>Main Street 11, 01234 Anytown, AnyState, USA</code>. If you're passing the some GPS coordinates, you will see the location of the asset within the webapplication in the consuming asset detail view. Also the certificate once created can only change owners upto 3 times

<code>
{
    type": "CREATE_PRODUCING_ASSET",
    data": {
        "smartMeter": "0x00f4af465162c05843ea38d203d37f7aad2e2c17",
        "smartMeterPK": "09f08bc14bfdaf427fdd0eb676db21a86fa908a25870158345e4f847b5ada35e",
        "owner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "operationalSince": 1514764800,
        "capacityWh": 10000,
        "lastSmartMeterReadWh": 0,
        "active": true,
        "lastSmartMeterReadFileHash": "",
        "country": "USA",
        "region": "AnyState",
        "zip": "01234",
        "city": "Anytown",
        "street": "Main Street",
        "houseNumber": "10",
        "gpsLatitude": "0",
        "gpsLongitude": "0",
        "timezone": "America/Los_Angeles",
        "assetType": "Biomass from agriculture",
        "cO2UsedForCertificate": 0,
        "complianceRegistry": "TIGR",
        "otherGreenAttributes": "N.A.",
        "typeOfPublicSupport": "N.A"
    }
}
</code>

### SAVE_SMARTMETER_READ_CONSUMING
usage: command store a new meterreading of an consuming asset
<br>params:
* <code>assetId</code>: the assetID for the meterreading
* <code>smartMeter</code>: the smartMeter address associated with the asset
* <code>smartMeterPK</code>: the smartMeter private key associated with the asset
* <code>meterreading</code>: the amount of energy to be logged (counter)
* <code>filehash</code>: the filehash

#### example
We want to log a new meterreading for the consuming asset with id <code>0</code>. The transaction to do so must be signed with smartMeter's privatekey associated with the asset. The new meterreading will be <code>100000</code> Wh with the filehash <code>newMeterRead</code>.
Keep in mind that the meterrading is not doing any addition, so the meterreading you pass here will be the new reading of the asset.

<code>
{
    "type": "SAVE_SMARTMETER_READ_CONSUMING",
    "data": {
        "assetId": 0,
        "smartMeter": "0x1112ec367b20d2bffd40ee11523c3d36d61adf1b",
        "smartMeterPK": "50764e302e4ed8ce624003deca642c03ce06934fe77585175c5576723f084d4c",
        "meterreading": 100000,
        "filehash": "newMeterRead",
    }
}
</code>

### SAVE_SMARTMETER_READ_PRODUCING
usage: command store a new meterreading of an producing asset
<br>params:
* <code>assetId</code>: the assetID for the meterreading
* <code>smartMeter</code>: the smartMeter address associated with the asset
* <code>smartMeterPK</code>: the smartMeter private key associated with the asset
* <code>meterreading</code>: the amount of energy to be logged (counter)
* <code>filehash</code>: the filehash

#### example
We want to log a new meterreading for the producing asset with id <code>0</code>. The transaction to do so must be signed with smartMeter's privatekey associated with the asset. The new meterreading will be <code>100000</code> Wh with the filehash <code>newMeterRead</code>.
Keep in mind that the meterrading is not doing any addition, so the meterreading you pass here will be the new reading of the asset.

<code>
{
    "type": "SAVE_SMARTMETER_READ_PRODUCING",
    "data": {
        "assetId": 0,
        "smartMeter": "0x00f4af465162c05843ea38d203d37f7aad2e2c17",
        "smartMeterPK": "09f08bc14bfdaf427fdd0eb676db21a86fa908a25870158345e4f847b5ada35e",
        "meterreading": 100000,
        "filehash": "newMeterRead",
    }
}
</code>

### SEND_ERC20_TOKENS_TO
usage: send some ERC20 tokens to an address
<br>params:
* <code>address</code>: address to which ERC20 tokens should be sent
* <code>amount</code>: amount of ERC20 tokens

<code>
{
    "type": "SEND_ERC20_TOKENS_TO",
    "data": {
        "address": "0x7672fa3f8c04abbcbad14d896aad8bedece72d2b",
        "amount": 500
    }
}
</code>

### TRANSFER_CERTIFICATE
usage: command to transfer the ownership of a certificate
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>assetOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>assetOwnerPK</code>: private key of the current owner of the certificate
* <code>addressTo</code>: address of the trader account to whom the certificate is to be transferred(must having trading rights)

#### example
We want to transfer the certificate with id <code>0</code>. The transaction to do so must be signed by the assetOwner proving the current ownership of the certificate. Therefore the asset owner's address and private key are required. The certificate's ownership will be transferred to <code>0x4095f1db44884764C17c7A9A31B4Bf20f5779691</code><br>

###### NOTE: The current owner of the asset and the future owner must both have trading rights.
<code>
{
    "type": "TRANSFER_CERTIFICATE",
    "data": {
        "certId": 0,
        "assetOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "assetOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047",
        "addressTo": "0x4095f1db44884764C17c7A9A31B4Bf20f5779691"
    }
}
</code>

### SPLIT_CERTIFICATE
usage: command to split the certificate into two certificates carrying varying Wh readings
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>assetOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>assetOwnerPK</code>: private key of the current owner of the certificate
* <code>splitValue</code>: splitting of the certificate with respect to Wh readings(need not be 50% of the parent certificate)

#### example
We want to split the certificate with id <code>1</code>. The transaction to do so must be signed by the assetOwner proving the current ownership of the certificate. Therefore the asset owner's address and private key are required. The certificate will be broken into two, one containing <code>15000 Wh</code> worth readings and other containing the remaining <code>Wh</code> of the parent certificate.

<code>
{
    "type": "SPLIT_CERTIFICATE",
    "data": {
        "certId":1,
        "assetOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "assetOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047",
        "splitValue": 15000
    }
}
</code>


### PUBLISH_CERTIFICATE_FOR_SALE
usage: command to publish a certificate for sale using ERC-20 tokens
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>certificateOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>certificateOwnerPK</code>: private key of the current owner of the certificate
* <code>price</code>: price of the certificate in unit of the ERC20 test token

#### example
<code>
{
    "type": "PUBLISH_CERTIFICATE_FOR_SALE",
    "data": {
        "certId": 4,
        "price": 1000,
        "certificateOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "certificateOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047"
    }
}
</code>


### PUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN
usage: command to publish a certificate for sale using off chain settlement in fiat currencies (EUR, USD)
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>price</code>: price of the certificate in unit of the ERC20 test token
* <code>certificateOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>certificateOwnerPK</code>: private key of the current owner of the certificate
* <code>currency</code>: currency that will be used to do perform the settlement. The list of currencies can be found [here](https://github.com/energywebfoundation/ew-utils-general-lib/blob/master/src/blockchain-facade/EnumExports.ts#L8)

#### example
<code>
{
    "type": "PUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN",
    "data": {
        "certId": 4,
        "price": 1000,
        "certificateOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "certificateOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047",
        "currency": "USD"
    }
}
</code>

### REQUEST_CERTIFICATES
usage: command to request certificates for smart meter reads, to get certificate this request has to be later approved, for example using: APPROVE_CERTIFICATION_REQUEST action
<br>params:
* <code>assetId</code>: id of the asset
* <code>lastRequestedSMRead</code>: index of last smart meter read to be included in certification request
* <code>assetOwner</code>: address of asset owner
* <code>assetOwnerPK</code>: private key of the asset owner

#### example
<code>
{
    "type": "REQUEST_CERTIFICATES",
    "data": {
        "assetId": 0,
        "lastRequestedSMRead": 2,
        "assetOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "assetOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047"
    }
}
</code>

### UNPUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN
usage: command to unbpublish (remove) a certificate from sale
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>certificateOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>certificateOwnerPK</code>: private key of the current owner of the certificate

#### example
<code>
{
    "type": "UNPUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN",
    "data": {
        "certId": 4,
        "certificateOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "certificateOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047"
    }
}
</code>

### BUY_CERTIFICATE
usage: command to transfer the ownership of a certificate
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>price</code>: price of the certificate in unit of the ERC20 test token
* <code>buyer</code>: address of the trader who wants to buy the certificate
* <code>buyerPK</code>: private key of the trader who wants to buy the certificate
* <code>addressTo</code>: address of the trader account to whom the certificate is to be transferred(must having trading rights)

#### example
We want to buy the certificate with id <code>4</code> at the specified price of <code>1000</code>. The transaction to do so must be signed by the trader to prevent repudiation of fund transfer. Therefore the trader's address and private key are required. Before the certificate can be bought the trader must approve the asset owner (<code>0x4095f1db44884764C17c7A9A31B4Bf20f5779691</code>) of the funds specified as price on the certificate.<br>

###### NOTE: The current owner of the asset and the future owner must both have trading rights.
<code>
{
    "type": "BUY_CERTIFICATE",
    "data": {
        "certId": 4,
        "price": 1000,
        "buyer": "0x4095f1db44884764C17c7A9A31B4Bf20f5779691",
        "buyerPK": "0x9d66d342a3b6014a7cff6ff0379b192dbe193e43bb6979625c600c4996bb3b85",
        "assetOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d"
    }
}
</code>

### BUY_CERTIFICATE_BULK
usage: command to buy multiple certificates
<br>params:
* <code>certificateIds</code>: ids of the certificates that want to be bought
* <code>buyer</code>: address of the trader who wants to buy the certificates
* <code>buyerPK</code>: private key of the trader who wants to buy the certificates

#### example
We want to buy the certificates <code>0</code>, <code>1</code> and <code>2</code>.

###### NOTE: The current buyer and the certificate owners must both have trading rights.
<code>
{
    "type": "BUY_CERTIFICATE_BULK",
    "data": {
        "certificateIds": [0, 1, 2],
        "buyer": "0x7672fa3f8c04abbcbad14d896aad8bedece72d2b",
        "buyerPK": "0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7"
    }
}
</code>

### CREATE_DEMAND
usage: command to create a demand
<br>params:
* <code>trader</code>: address of the trader creating the demand
* <code>traderPK</code>: private key of the trader creating the demand
* <code>timeframe</code>: timeframe of contract
* <code>maxPricePerMwh</code>: maximum price per MWh
* <code>currency</code>: currency of exchange as string (USD,
    EUR,
    THB,
    SGD)
* <code>producingAsset</code>: <BLANK>
* <code>consumingAsset</code>: <BLANK>
* <code>country</code>: country where the asset is located
* <code>region</code>: region where the asset is located
* <code>assettype</code>: Type of asset as string (Wind,
    Solar,
    RunRiverHydro,
    BiomassGas)
* <code>minCO2Offset</code>: minimum amount of CO2 offset required
* <code>otherGreenAttributes</code>: green attributes as string
* <code>typeOfPublicSupport</code>: type of public support as string
* <code>energyPerTimeFrame</code>: required energy per time frame
* <code>registryCompliance</code>: complaince as string (none,
    IREC,
    EEC,
    TIGR)

#### example
We want to report a demand with target watt-hour per period(timeframe) as <code>10</code> and price per certified watt-hour as  <code>10</code>. The asset type required is <code>BiomassGas</code> which must comply with <code>EEC</code>. It is preferred to be a <code>hourly</code> contract with the currency of exchange set as <code>USD</code>. Trader account <code>0x4095f1db44884764C17c7A9A31B4Bf20f5779691</code> is making the demand.

<code>
{
    "type": "CREATE_DEMAND",
    "data": {
        "trader": "0x4095f1db44884764C17c7A9A31B4Bf20f5779691",
        "traderPK": "0x9d66d342a3b6014a7cff6ff0379b192dbe193e43bb6979625c600c4996bb3b85",
        "timeframe": "hourly",
        "maxPricePerMwh": 10,
        "currency": "USD",
        "producingAsset": 0,
        "consumingAsset": 0,
        "country": "string",
        "region": "string",
        "assettype": "Biomass from agriculture",
        "minCO2Offset": 10,
        "otherGreenAttributes": "string",
        "typeOfPublicSupport": "string",
        "energyPerTimeFrame": 10,
        "registryCompliance": "EEC"
    }
}
</code>

### CREATE_SUPPLY
usage: command to report a supply
<br>params:
* <code>assetId</code>: asset id of the asset which is creating the supply
* <code>assetOwner</code>: asset owner's address
* <code>assetOwnerPK</code>: asset owner's private key
* <code>price</code>: price per certified Wh
* <code>currency</code>: currency of exchange as string (USD,
    EUR,
    THB,
    SGD)
* <code>availableWh</code>: Available watt-hour per period
* <code>timeframe</code>: period or the timeframe of the contract

#### example
We want to create a supply linked to asset id <code>1</code>. The supply reports the avilable watt-hour per period(timeframe <code>hourly</code>) to be <code>10</code>. The price per watt-hour is set at <code>10</code>in units of <code>USD</code>(i.e. 10 USD per certified watt-hour).

<code>
{
    "type": "CREATE_SUPPLY",
    "data": {
        "assetId": 1,
        "assetOwner": "0x51ba6877a2c4580d50f7ceece02e2f24e78ef123",
        "assetOwnerPK": "0x6ee02c057cda3019132c670b425e6caea4f055ac8f64377d2463f123e71babec",
        "price": 10,
        "currency": "USD",
        "availableWh": 10,
        "timeframe": "hourly"
    }
}
</code>

### MAKE_AGREEMENT
usage: command to make an agreement - pairing a demand with an appropriate supply.
<br>params:
* <code>creator</code>: (address) creator of the agreement (either the trader or the supplier)
* <code>creatorPK</code>: private key of the creator
* <code>startTime</code>: contract's start time (UNIX, UTC)
* <code>endTime</code>: contract's end time (UNIX, UTC)
* <code>price</code>: agreed price per certified watt-hour
* <code>currency</code>: currency of exchange as string (USD,
    EUR,
    THB,
    SGD)
* <code>timeframe</code>: period or the timeframe of the contract
* <code>period</code>: total period of the contract in units of timeframe
* <code>currentWh</code>: current Wh reading of the asset
* <code>currentPeriod</code>: current period of the contract
* <code>demandId</code>: ID number of the demand that is being addressed
* <code>supplyId</code>:ID number of the supply that is paired with the demand

#### example
We want to make an agreement between the demand<code>0</code> and supply<code>0</code>. The agreed price between the two parties is set at <code>10 USD</code> with the timeframe of the contract being <code>hourly</code> for a period of <code>10</code>(hours). The current period and watt-hour readings are stored as <code>0</code> marking the genesis of the agreement. The trader with the address <code>0x4095f1db44884764C17c7A9A31B4Bf20f5779691</code> is creating the agreement. Although the supplier must approve the agreement to actually confirm it.

<code>
{
    "type": "MAKE_AGREEMENT",
    "data": {
      "creator": "0x4095f1db44884764C17c7A9A31B4Bf20f5779691",
      "creatorPK": "0x9d66d342a3b6014a7cff6ff0379b192dbe193e43bb6979625c600c4996bb3b85",
      "startTime": 1549055441,
      "endTime": 1549056441,
      "price": 10,
      "currency": "USD",
      "timeframe": "hourly",
      "period": 10,
      "currentWh": 0,
      "currentPeriod": 0,
      "demandId": 0,
      "supplyId": 0
    }
}
</code>

##### Sidenote:
If you set the <code>startTime</code> as <code>-1</code> it would be automatically set to the latest block timestamp. Accordingly, <code>endTime</code> would be set as <code>startTime</code> + <code>endTime</code>.

<code>
    "startTime": -1,
    "endTime": 3600,
</code>

for the above code block <code>startTime</code> would be the latest block timestamp and <code>endTime</code> would be latest block timestamp + 3600 seconds (one hour).

### APPROVE_AGREEMENT
usage: command to approve an agreement
<br>params:
* <code>agreementId</code>: ID of the agreement you want to approve on
* <code>assetOwner</code>: address of the supplier/trader who wants to approve the agreement
* <code>assetOwnerPK</code>: approver's private key

#### example
We had created an agreement with id <code>0</code> signed by the traders account. Although to confirm the agreement the supplier must approve the agreement. Therefore the supplier with address <code>0x51ba6877a2c4580d50f7ceece02e2f24e78ef123</code> approves agreement id <code>0</code> in the below example.

<code>
{
    "type": "APPROVE_AGREEMENT",
    "data": {
        "agreementId": 0,
        "agree": "0x51ba6877a2c4580d50f7ceece02e2f24e78ef123",
        "agreePK": "0x6ee02c057cda3019132c670b425e6caea4f055ac8f64377d2463f123e71babec"
    }
}
</code>


#### SLEEP
usage: command to pause the flow for a certain amount of time
<br>params:
* <code>data</code>: amount of ms to sleep

#### example
We want to pause the flow for <code>2</code> secondss

<code>{"type": "SLEEP", "data": 2000}</code>

## Docker

```
docker-compose build
docker-compose run demo npm run start
```

If you would like to start a local Ganache server instance running on localhost:8545 please run this command:

```
docker-compose run -p 8545:8545 demo npm run start-ganache
```

And replace `localhost` in `connection-config.json`, `src/config.ts` to Docker host machine IP, for example: `172.17.0.1`.

[For more comprehensive Docker deployment instructions please refer to this page.](https://github.com/energywebfoundation/origin/wiki/Docker-Deployment)