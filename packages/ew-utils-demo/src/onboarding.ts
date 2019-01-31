import * as fs from 'fs';
import Web3 = require('web3');
import { deployEmptyContracts } from './deployEmpty'
import { logger } from './Logger';

import * as User from 'ew-user-registry-lib'
import * as Asset from 'ew-asset-registry-lib'
import * as GeneralLib from 'ew-utils-general-lib';

import { UserContractLookup, UserLogic } from 'ew-user-registry-contracts';
import { AssetContractLookup, AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export const onboard = async() => {

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

  //set the admin account as an asset admin
  await userLogic.setUser(adminAccount.address, 'admin', { privateKey: adminPK });
  await userLogic.setRoles(adminAccount.address, 3, { privateKey: adminPK });


  //blockchain configuration
  let conf: GeneralLib.Configuration.Entity;

  conf = {
      blockchainProperties: {
          activeUser: {
              address: adminAccount.address, privateKey: adminPK,
          },
          producingAssetLogicInstance: assetProducingRegistryLogic,
          consumingAssetLogicInstance: assetConsumingRegistryLogic,
          userLogicInstance: userLogic,
          web3,
      },
      offChainDataSource: {
          baseUrl: 'http://localhost:3030',
      },
      logger,
  };

  const actionsArray = demoConfig.flow

  for(const action of actionsArray){

    switch(action.type){
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

        let assetTypeConfig

        switch (action.data.assetType) {
            case 'Wind': assetTypeConfig = Asset.ProducingAsset.Type.Wind
                break
            case 'Solar': assetTypeConfig = Asset.ProducingAsset.Type.Solar
                break
            case 'RunRiverHydro': assetTypeConfig = Asset.ProducingAsset.Type.RunRiverHydro
                break
            case 'BiomassGas': assetTypeConfig = Asset.ProducingAsset.Type.BiomassGas
        }

        let assetCompliance

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
        console.log("sleep")
        await sleep(action.data);
        break

      default:
        continue
    }
  }

}
