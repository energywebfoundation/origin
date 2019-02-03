# EWF - COO - DEMO

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
* parity: if you're using docker you can run the command <code>npm run parity-docker</code>
* your own blockchain client connected to any ethereum-like chain (e.g. Tobalaba)

This demo is using raw-transactions, so you don't have to unlock your accounts in the blockchain-client. Because this demo was developed with Tobalaba in mind the current gasPrice is set to 0 thus enabling sending transaction from accounts without any balance.<br>
Currently the demo is configured to use the port <code>8545</code>. In case you're using your own client please make sure that the client is listening to that port. <br>

Apart from starting a blockchain you must also start a test backend server using the command <code>npm run start-test-backend</code>. This is because, with release B some of the non-vital data is stored off chain on a server. Hence the deployment of test backend is necessary for demo purposes.<br>

We strongly recommend to change the keys included in this repo when running on a public chain (see configuration)

## Configuration

The configuration and flow of actions is done with the file [demo-config.json](config/demo-config.json) in the config-folder.

The following keys are required:
* topAdminPrivateKey: the private key of the topAdmin
* flow: an array with flow actions. They will get executed in the ordering within the config-file

### flow actions

Every flowaction has two entries:
* <code>type</code>: the action type
* <code>data</code>: the corresponding data for the action type

Currently the following action types are supported:
* CREATE_ACCOUNT
* CREATE_CONSUMING_ASSET
* CREATE_PRODUCING_ASSET
* INITIALIZE_CERTIFICATES
* SAVE_SMARTMETER_READ_PRODUCING
* SAVE_SMARTMETER_READ_CONSUMING
* TRANSFER_CERTIFICATE
* SPLIT_CERTIFICATE
* SET_ERC20_CERTIFICATE
* BUY_CERTIFICATE
* CREATE_DEMAND
* CREATE_SUPPLY
* MAKE_AGREEMENT
* APPROVE_AGREEMENT

#### CREATE_ACCOUNT
usage: command to onboard a new user <br>
params:
* <code>firstName</code>: the first name of a user
* <code>surname</code>: the surname of a user
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
* <code>matcher</code>: the matcher authorised for the asset (must have matcher rights)
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
* <code>maxCapacitySet</code>: flag if the maximal capacity is set
* <code>certificatesUsedForWh</code>: amount of certificates already used by the consuming asset, will be 0 in most cases

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
        "matcher": "0x585cc5c7829b1fd303ef5c019ed23815a205a59e",
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
        "maxCapacitySet": true,
        "certificatesUsedForWh": 0
    }
}
</code>

### CREATE_PRODUCING_ASSET
usage: command to onboard a new producing asset
<br>params:
* <code>smartMeter</code>: ethereum address of the smart meter
* <code>smartMeterPK</code>: private key of the ethereum address (needed to simuate meterreading)
* <code>owner</code>: ethereum address of the owner of the asset, has to have to asset manager rights
* <code>matcher</code>: the matcher authorised for the asset (must have matcher rights)
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
* <code>assetType</code>: Type of asset as string (Wind,
    Solar,
    RunRiverHydro,
    BiomassGas)
* <code>certificatesCreatedForWh</code>: amount of certificates created for wh
* <code>lastSmartMeterCO2OffsetRead</code>: last CO2 offset read
* <code>cO2UsedForCertificate</code>: amount of CO2 already used for certificates
* <code>complianceRegistry</code>: complaince as string (none,
    IREC,
    EEC,
    TIGR)
* <code>otherGreenAttributes</code>: green attributes as string
* <code>typeOfPublicSupport</code>: type of public support as string
* <code>maxOwnerChanges</code>: specifies the maximum number of hands the certificates can change

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
        "matcher": "0x585cc5c7829b1fd303ef5c019ed23815a205a59e",
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
        "assetType": "BiomassGas",
        "certificatesCreatedForWh": 0,
        "lastSmartMeterCO2OffsetRead": 0,
        "cO2UsedForCertificate": 0,
        "complianceRegistry": "TIGR",
        "otherGreenAttributes": "N.A.",
        "typeOfPublicSupport": "N.A",
        "maxOwnerChanges": 3
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

### SET_ERC20_CERTIFICATE
usage: command to deploy a test ERC20 token and the enable the certificate to use ERC20 tokens as a payment
<br>params:
* <code>certId</code>: id of the certificate to be transferred
* <code>assetOwner</code>: address of the current owner of the certificate(must have trading rights)
* <code>assetOwnerPK</code>: private key of the current owner of the certificate
* <code>price</code>: price of the certificate in unit of the ERC20 test token
* <code>testAccount</code>: an account address that gets intial ERC20 funds

#### example
We want to enable ERC20 trading in certificate with id <code>4</code>. The transaction to do so must be signed by the assetOwner proving the current ownership of the certificate. Therefore the asset owner's address and private key are required. The price of the certificate would be <code>1000</code> ERC20 test tokens. The initial funds of ERC20 test tokens will go to the account with the address <code>0x4095f1db44884764C17c7A9A31B4Bf20f5779691</code>(for demo: it is set equal to the trader's address who will buy the certificate)

<code>
{
    "type": "SET_ERC20_CERTIFICATE",
    "data": {
        "certId":4,
        "assetOwner": "0x33496f621350cea01b18ea5b5c43c6c233c3f72d",
        "assetOwnerPK": "0x96ce644659ea5572aedc29296c866a62c36c6cdcafc8801c1c46d02abc8c0047",
        "price": 1000,
        "testAccount": "0x4095f1db44884764C17c7A9A31B4Bf20f5779691"
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

#### SLEEP
usage: command to pause the flow for a certain amount of time
<br>params:
* <code>data</code>: amount of ms to sleep

#### example
We want to pause the flow for <code>2</code> secondss

<code>{"type": "SLEEP", "data": 2000}</code>

## starting the demo
Once all the actions are set within the config-file simply run <code>npm run start-demo</code>. It will freshly deploy all contracts and setup everything for you. After this is done, it will automatically run all the flow-actions. <br>
