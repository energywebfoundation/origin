// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it; Chirag Parmar, chirag.parmar@slock.it

import { logger } from './Logger';

import * as User from 'ew-user-registry-lib'
import * as Asset from 'ew-asset-registry-lib'
import * as GeneralLib from 'ew-utils-general-lib';

import { UserContractLookup, UserLogic } from 'ew-user-registry-contracts';
import { AssetContractLookup, AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export const onboardDemo = async(actionString: string, conf: GeneralLib.Configuration.Entity, adminPrivateKey: string) => {

  const action = JSON.parse(actionString);

  const adminPK = adminPrivateKey.startsWith('0x') ?
      adminPrivateKey : '0x' + adminPrivateKey;

  const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

  switch(action.type){
    case "CREATE_ACCOUNT":
      await conf.blockchainProperties.userLogicInstance.setUser(action.data.address, action.data.organization, { privateKey: adminPK })
      await conf.blockchainProperties.userLogicInstance.setRoles(action.data.address, action.data.rights, { privateKey: adminPK } )

      console.log("Onboarded a new user:", action.data.address)
      console.log("User Properties:", action.data.organization, action.data.rights)

      break

    case "CREATE_PRODUCING_ASSET":

      console.log("-----------------------------------------------------------")


      const assetProducingProps: Asset.ProducingAsset.OnChainProperties = {
          smartMeter: { address: action.data.smartMeter },
          owner: { address: action.data.owner },
          lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
          active: action.data.active,
          lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
          matcher: [{address: action.data.matcher}],
          propertiesDocumentHash: null,
          url: null,
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
      console.log("Unidentified Command: " + action.type)
  }
}
