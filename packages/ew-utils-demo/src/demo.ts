import * as fs from 'fs';
import Web3 = require('web3');
import { deployEmptyContracts } from './deployEmpty'
import { logger } from './Logger';

import * as Certificate from 'ew-origin-lib';
import * as User from 'ew-user-registry-lib'
import * as Asset from 'ew-asset-registry-lib'
import * as GeneralLib from 'ew-utils-general-lib';
import * as Market from 'ew-market-lib';

import { UserContractLookup, UserLogic } from 'ew-user-registry-contracts';
import { AssetContractLookup, AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';
import { OriginContractLookup, CertificateLogic, migrateCertificateRegistryContracts } from 'ew-origin-contracts';
import { deployERC20TestToken, Erc20TestToken, TestReceiver, deployERC721TestReceiver } from 'ew-erc-test-contracts';
import { MarketContractLookup, MarketLogic } from 'ew-market-contracts';


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export const marketDemo = async() => {

  await deployEmptyContracts()

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());
  const demoConfig = JSON.parse(fs.readFileSync(process.cwd() + '/demo-config.json', 'utf8').toString());
  const contractConfig = JSON.parse(fs.readFileSync(process.cwd() + '/contractConfig.json', 'utf8').toString());

  const web3 = new Web3(connectionConfig.develop.web3);

  const adminPK = demoConfig.topAdminPrivateKey.startsWith('0x') ?
      demoConfig.topAdminPrivateKey : '0x' + demoConfig.topAdminPrivateKey;

  const matcherPK = demoConfig.matcherPrivateKey.startsWith('0x') ?
      demoConfig.matcherPrivateKey : '0x' + demoConfig.matcherPrivateKey;

  const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);
  const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK)

  //create logic instances
  const userLogic = new UserLogic(web3, contractConfig.userLogic)
  const assetProducingRegistryLogic = new AssetProducingRegistryLogic(web3, contractConfig.assetProducingRegistryLogic)
  const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic(web3, contractConfig.assetConsumingRegistryLogic)
  const certificateLogic = new CertificateLogic(web3, contractConfig.certificateLogic)
  const marketLogic = new MarketLogic(web3, contractConfig.marketLogic)

  //set the admin account as an asset admin
  await userLogic.setUser(adminAccount.address, 'admin', { privateKey: adminPK });
  await userLogic.setRoles(adminAccount.address, 3, { privateKey: adminPK });

  //initialize a token to handle demo erc20 trading
  let erc20TestToken: Erc20TestToken

  //initialize variables for storing timeframe and currency
  let timeFrame
  let currency
  let assetTypeConfig
  let assetCompliance

  //blockchain configuration
  let conf: GeneralLib.Configuration.Entity;

  conf = {
      blockchainProperties: {
          activeUser: {
              address: adminAccount.address, privateKey: adminPK,
          },
          producingAssetLogicInstance: assetProducingRegistryLogic,
          consumingAssetLogicInstance: assetConsumingRegistryLogic,
          certificateLogicInstance: certificateLogic,
          userLogicInstance: userLogic,
          marketLogicInstance: marketLogic,
          web3,
      },
      offChainDataSource: {
          baseUrl: 'http://localhost:3030',
      },
      logger,
  };

  const actionsArray = demoConfig.flow

  for(const action of actionsArray) {
    switch(action.type) {
      case "CREATE_ACCOUNT":
        await userLogic.setUser(action.data.address, action.data.organization, { privateKey: adminPK })
        await userLogic.setRoles(action.data.address, action.data.rights, { privateKey: adminPK } )

        console.log("Onboarded a new user:", action.data.address)
        console.log("User Properties:", action.data.organization, action.data.rights)

        break

      case "CREATE_PRODUCING_ASSET":

        console.log("-----------------------------------------------------------")


        const assetProducingProps: Asset.ProducingAsset.OnChainProperties = {
            certificatesUsedForWh: action.data.certificatesCreatedForWh,
            smartMeter: { address: action.data.smartMeter },
            owner: { address: action.data.owner },
            lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
            active: action.data.active,
            lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
            matcher: [{address: action.data.matcher}],
            propertiesDocumentHash: null,
            url: null,
            certificatesCreatedForWh: action.data.certificatesCreatedForWh,
            lastSmartMeterCO2OffsetRead: action.data.lastSmartMeterCO2OffsetRead,
            maxOwnerChanges: action.data.maxOwnerChanges,
        };

        switch (action.data.assetType) {
            case 'Wind': assetTypeConfig = Asset.ProducingAsset.Type.Wind
                break
            case 'Solar': assetTypeConfig = Asset.ProducingAsset.Type.Solar
                break
            case 'RunRiverHydro': assetTypeConfig = Asset.ProducingAsset.Type.RunRiverHydro
                break
            case 'BiomassGas': assetTypeConfig = Asset.ProducingAsset.Type.BiomassGas
        }

        switch (action.data.complianceRegistry) {
            case 'IREC': assetCompliance = Asset.ProducingAsset.Compliance.IREC
                break
            case 'EEC': assetCompliance = Asset.ProducingAsset.Compliance.EEC
                break
            case 'TIGR': assetCompliance = Asset.ProducingAsset.Compliance.TIGR
                break
            default:
                assetCompliance = Asset.ProducingAsset.Compliance.none
                break
        }

        const assetProducingPropsOffChain: Asset.ProducingAsset.OffChainProperties = {
            operationalSince: action.data.operationalSince,
            capacityWh: action.data.capacityWh,
            country: action.data.country,
            region: action.data.region,
            zip: action.data.zip,
            city: action.data.city,
            street: action.data.street,
            houseNumber: action.data.houseNumber,
            gpsLatitude: action.data.gpsLatitude,
            gpsLongitude: action.data.gpsLongitude,
            assetType: assetTypeConfig,
            complianceRegistry: assetCompliance,
            otherGreenAttributes: action.data.otherGreenAttributes,
            typeOfPublicSupport: action.data.typeOfPublicSupport,
        };

        try {
          const asset = await Asset.ProducingAsset.createAsset(assetProducingProps, assetProducingPropsOffChain, conf);
          console.log("Producing Asset Created: ", asset.id)
        } catch(e) {
          console.log("ERROR: " + e)
        }

        console.log("-----------------------------------------------------------\n")

        break
      case "CREATE_CONSUMING_ASSET":

        console.log("-----------------------------------------------------------")

        const assetConsumingProps: Asset.ConsumingAsset.OnChainProperties = {
          certificatesUsedForWh: action.data.certificatesCreatedForWh,
          smartMeter: { address: action.data.smartMeter },
          owner: { address: action.data.owner },
          lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
          active: action.data.active,
          lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
          matcher: [{ address: action.data.matcher }],
          propertiesDocumentHash: null,
          url: null,
        };

        const assetConsumingPropsOffChain: Asset.Asset.OffChainProperties = {
          capacityWh: action.data.capacityWh,
          city: action.data.city,
          country: action.data.country,
          gpsLatitude: action.data.gpsLatitude,
          gpsLongitude: action.data.gpsLongitude,
          houseNumber: action.data.houseNumber,
          operationalSince: action.data.operationalSince,
          region: action.data.region,
          street: action.data.street,
          zip: action.data.zip,
        };

        try {
          const asset = await Asset.ConsumingAsset.createAsset(assetConsumingProps, assetConsumingPropsOffChain, conf);
          console.log("Consuming Asset Created:", asset.id)
        } catch(e) {
          console.log(e)
        }

        console.log("-----------------------------------------------------------\n")
        break

      case "SLEEP":
        console.log("SLEEP: " + action.data)
        await sleep(action.data);
        break

        case "SAVE_SMARTMETER_READ_PRODUCING":

          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.smartMeter, privateKey: action.data.smartMeterPK,
          };

          try {
            let asset = await (new Asset.ProducingAsset.Entity(action.data.assetId, conf).sync());
            await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
            asset = await asset.sync();
            console.log("Producing smart meter reading saved")
          } catch(e) {
            console.log("Error saving smart meter read for producing asset\n" + e)
          }

          console.log("-----------------------------------------------------------\n")

          break
        case "SAVE_SMARTMETER_READ_CONSUMING":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.smartMeter, privateKey: action.data.smartMeterPK,
          };

          try {
            let asset = await (new Asset.ConsumingAsset.Entity(action.data.assetId, conf).sync());
            await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
            asset = await asset.sync();
            console.log("Consuming meter reading saved")
          } catch(e) {
            console.log("Error saving smart meter read for consuming asset\n" + e)
          }

          console.log("-----------------------------------------------------------\n")

          break

        case "INITIALIZE_CERTIFICATES":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: adminAccount.address, privateKey: adminPK,
          };

          try {
            await conf.blockchainProperties.producingAssetLogicInstance.setMarketLookupContract(action.data.assetId, contractConfig.originContractLookup, { privateKey: action.data.assetOwnerPK });
            console.log("Certificates for Asset #" + action.data.assetId + " initialized")
          } catch(e) {
            console.log("Error intializing certificates\n" + e)
          }
          console.log("-----------------------------------------------------------")
          break

        case "TRANSFER_CERTIFICATE":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
          };

          try {
            console.log("Asset Owner Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf)))
            console.log("Asset Owner Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.addressTo, conf)))
            const certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
            await certificate.transferFrom(action.data.addressTo);
            console.log("Certificate Transferred")
            console.log("Asset Owner Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf)))
            console.log("Asset Owner Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.addressTo, conf)))
          } catch(e) {
            console.log("Error transferring certificates\n" + e)
          }


          console.log("-----------------------------------------------------------\n")
          break

        case "SPLIT_CERTIFICATE":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
          };

          try {
            let certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
            await certificate.splitCertificate(action.data.splitValue);
            certificate = await certificate.sync()

            console.log("Certificate Split into:", certificate.children)

            for(const cId of certificate.children) {
              const c = await(new Certificate.Certificate.Entity(cId.toString(), conf).sync());
              console.log("Child Certificate #" + cId + " - PowerInW: " + c.powerInW)
            }

          } catch(e) {
            console.log("Error transferring certificates\n" + e)
          }


          console.log("-----------------------------------------------------------\n")
          break

        case "SET_ERC20_CERTIFICATE":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
          };

          try{
            let certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
            await certificate.setOnChainDirectPurchasePrice(action.data.price);
            certificate = await certificate.sync();

            const erc20TestAddress = (await deployERC20TestToken(
                web3,
                action.data.testAccount,
                adminPK,
            )).contractAddress;

            erc20TestToken = new Erc20TestToken(web3, erc20TestAddress);
            await certificate.setTradableToken(erc20TestAddress);
            certificate = await certificate.sync();
            console.log("Demo ERC token created: " + erc20TestAddress)

          } catch(e) {
            console.log("Error setting ERC20 for certificate trading\n", e)
          }

          console.log("-----------------------------------------------------------\n")

          break
        case "BUY_CERTIFICATE":
          console.log("-----------------------------------------------------------")

          conf.blockchainProperties.activeUser = {
            address: action.data.buyer , privateKey: action.data.buyerPK,
          };


          await erc20TestToken.approve(action.data.assetOwner, action.data.price, {privateKey: action.data.buyerPK})
          console.log("Allowance: " + await erc20TestToken.allowance(action.data.buyer, action.data.assetOwner))


          try {
            console.log("Buyer Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.buyer, conf)))
            const certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
            await certificate.buyCertificate();
            console.log("Certificate Bought")
            console.log("Buyer Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.buyer, conf)))
          } catch(e) {
            console.log("Error buying Certificates\n" + e)
          }

          console.log("-----------------------------------------------------------\n")
          break

      case "CREATE_DEMAND":

        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.trader, privateKey: action.data.traderPK,
        };

        switch (action.data.assettype) {
            case 'Wind': assetTypeConfig = GeneralLib.AssetType.Wind
                break
            case 'Solar': assetTypeConfig = GeneralLib.AssetType.Solar
                break
            case 'RunRiverHydro': assetTypeConfig = GeneralLib.AssetType.RunRiverHydro
                break
            case 'BiomassGas': assetTypeConfig = GeneralLib.AssetType.BiomassGas
        }

        switch (action.data.registryCompliance) {
            case 'IREC': assetCompliance = GeneralLib.Compliance.IREC
                break
            case 'EEC': assetCompliance = GeneralLib.Compliance.EEC
                break
            case 'TIGR': assetCompliance = GeneralLib.Compliance.TIGR
                break
            default:
                assetCompliance = GeneralLib.Compliance.none
                break
        }

        switch (action.data.timeframe) {
          case 'yearly':
            timeFrame = GeneralLib.TimeFrame.yearly
            break
          case 'monthly':
            timeFrame = GeneralLib.TimeFrame.monthly
            break
          case 'daily':
            timeFrame = GeneralLib.TimeFrame.daily
            break
          case 'hourly':
            timeFrame = GeneralLib.TimeFrame.hourly
            break
        }

        switch (action.data.currency) {
          case 'Euro':
            currency = GeneralLib.Currency.Euro
            break
          case 'USD':
            currency = GeneralLib.Currency.USD
            break
          case 'Ether':
            currency = GeneralLib.Currency.Ether
            break
          case 'SingaporeDollar':
            currency = GeneralLib.Currency.SingaporeDollar
            break
        }

        const demandOffchainProps: Market.Demand.DemandOffchainproperties = {
            timeframe: timeFrame,
            pricePerCertifiedWh: action.data.pricePerCertifiedWh,
            currency: currency,
            productingAsset: action.data.producingAsset,
            consumingAsset: action.data.consumingAsset,
            locationCountry: action.data.country,
            locationRegion: action.data.region,
            assettype: assetTypeConfig,
            minCO2Offset: action.data.minCO2Offset,
            otherGreenAttributes: action.data.otherGreenAttributes,
            typeOfPublicSupport: action.data.typeOfPublicSupport,
            targetWhPerPeriod: action.data.targetWhPerPeriod,
            registryCompliance: assetCompliance,
        };

        const demandProps: Market.Demand.DemandOnChainProperties = {
          url: null,
          propertiesDocumentHash: null,
          demandOwner: action.data.trader,
        };

        try {
          const demand = await Market.Demand.createDemand(demandProps, demandOffchainProps, conf);
          delete demand.proofs;
          delete demand.configuration;
          console.log("Demand Created, ID: " + demand.id)
        } catch(e) {
          console.log("Error creating a demand\n" + e)
        }

        console.log("-----------------------------------------------------------\n")

        break
      case "CREATE_SUPPLY":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.assetOwner, privateKey: action.data.assetOwnerPK,
        };

        switch (action.data.timeframe) {
          case 'yearly':
            timeFrame = GeneralLib.TimeFrame.yearly
            break
          case 'monthly':
            timeFrame = GeneralLib.TimeFrame.monthly
            break
          case 'daily':
            timeFrame = GeneralLib.TimeFrame.daily
            break
          case 'hourly':
            timeFrame = GeneralLib.TimeFrame.hourly
            break
        }

        switch (action.data.currency) {
          case 'Euro':
            currency = GeneralLib.Currency.Euro
            break
          case 'USD':
            currency = GeneralLib.Currency.USD
            break
          case 'Ether':
            currency = GeneralLib.Currency.Ether
            break
          case 'SingaporeDollar':
            currency = GeneralLib.Currency.SingaporeDollar
            break
        }

        const supplyOffChainProperties: Market.Supply.SupplyOffchainProperties = {
            price: action.data.price,
            currency: currency,
            availableWh: action.data.availableWh,
            timeframe: timeFrame,
        };

        const supplyProps: Market.Supply.SupplyOnChainProperties = {
          url: null,
          propertiesDocumentHash: null,
          assetId: action.data.assetId,
        };


        try {
          const supply = await Market.Supply.createSupply(supplyProps, supplyOffChainProperties, conf);
          delete supply.proofs;
          delete supply.configuration;
          console.log("Onboarded Supply ID: " + supply.id)
        } catch(e) {
          console.log("Error onboarding supply\n" + e)
        }

        console.log("-----------------------------------------------------------\n")

        break

      case "MAKE_AGREEMENT":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.creator,
          privateKey: action.data.creatorPK,
        };

        switch (action.data.timeframe) {
          case 'yearly':
            timeFrame = GeneralLib.TimeFrame.yearly
            break
          case 'monthly':
            timeFrame = GeneralLib.TimeFrame.monthly
            break
          case 'daily':
            timeFrame = GeneralLib.TimeFrame.daily
            break
          case 'hourly':
            timeFrame = GeneralLib.TimeFrame.hourly
            break
        }

        switch (action.data.currency) {
          case 'Euro':
            currency = GeneralLib.Currency.Euro
            break
          case 'USD':
            currency = GeneralLib.Currency.USD
            break
          case 'Ether':
            currency = GeneralLib.Currency.Ether
            break
          case 'SingaporeDollar':
            currency = GeneralLib.Currency.SingaporeDollar
            break
        }

        const agreementOffchainProps: Market.Agreement.AgreementOffChainProperties = {
          start: action.data.startTime,
          ende: action.data.endTime,
          price: action.data.price,
          currency: currency,
          period: action.data.period,
          timeframe: timeFrame,
        };

        const matcherOffchainProps: Market.Agreement.MatcherOffchainProperties = {
          currentWh: action.data.currentWh,
          currentPeriod: action.data.currentPeriod,
        };

        const agreementProps: Market.Agreement.AgreementOnChainProperties = {
          propertiesDocumentHash: null,
          url: null,
          matcherDBURL: null,
          matcherPropertiesDocumentHash: null,
          demandId: action.data.demandId,
          supplyId: action.data.supplyId,
          allowedMatcher: [action.data.allowedMatcher],
        };

        try {
          const agreement = await Market.Agreement.createAgreement(agreementProps, agreementOffchainProps, matcherOffchainProps, conf);
          delete agreement.proofs;
          delete agreement.configuration;
          delete agreement.propertiesDocumentHash;
          delete agreement.matcherPropertiesDocumentHash;
          if(agreement.approvedBySupplyOwner && agreement.approvedByDemandOwner){
            console.log("Agreement Confirmed")
          }
          else if(!agreement.approvedByDemandOwner) {
            console.log("Demand Owner did not approve yet")
          }
          else if(!agreement.approvedBySupplyOwner) {
            console.log("Supply Owner did not approve yet")
          }
        } catch(e) {
          console.log("Error making an agreement\n" + e)
        }

        console.log("-----------------------------------------------------------\n")
        break
      case "APPROVE_AGREEMENT":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.agree,
          privateKey: action.data.agreePK,
        };

        try {
          let agreement: Market.Agreement.Entity = await (new Market.Agreement.Entity('0', conf)).sync();
          await agreement.approveAgreementSupply();
          agreement = await agreement.sync();
          if(agreement.approvedBySupplyOwner && agreement.approvedByDemandOwner){
            console.log("Agreement Confirmed")
          }
          else if(!agreement.approvedByDemandOwner) {
            console.log("Demand Owner did not approve yet")
          }
          else if(!agreement.approvedBySupplyOwner) {
            console.log("Supply Owner did not approve yet")
          }
        } catch(e) {
          console.log("Could not approve agreement\n" + e)
        }

        console.log("-----------------------------------------------------------\n")
      default:
        continue
    }
  }
}

marketDemo()
