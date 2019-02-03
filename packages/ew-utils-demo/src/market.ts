import * as fs from 'fs';
import Web3 = require('web3');
import { certificateDemo } from './certificate'
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

  const startTime = Date.now()

  await deployEmptyContracts()

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/config/connection-config.json', 'utf8').toString());
  const demoConfig = JSON.parse(fs.readFileSync(process.cwd() + '/config/demo-config.json', 'utf8').toString());
  const contractConfig = JSON.parse(fs.readFileSync(process.cwd() + '/config/contractConfig.json', 'utf8').toString());

  const web3 = new Web3(connectionConfig.develop.web3);

  const adminPK = demoConfig.topAdminPrivateKey.startsWith('0x') ?
      demoConfig.topAdminPrivateKey : '0x' + demoConfig.topAdminPrivateKey;

  const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

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
      case "CREATE_DEMAND":

        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.trader, privateKey: action.data.traderPK,
        };

        let assetTypeConfig

        switch (action.data.assettype) {
            case 'Wind': assetTypeConfig = GeneralLib.AssetType.Wind
                break
            case 'Solar': assetTypeConfig = GeneralLib.AssetType.Solar
                break
            case 'RunRiverHydro': assetTypeConfig = GeneralLib.AssetType.RunRiverHydro
                break
            case 'BiomassGas': assetTypeConfig = GeneralLib.AssetType.BiomassGas
        }

        let assetCompliance

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
        break
      default:
        const passString = JSON.stringify(action)
        await certificateDemo(passString, conf, adminPK)
    }
  }
  console.log("Total Time: " + ((Date.now()-startTime)/1000) + " seconds")
}

marketDemo()
