import * as fs from 'fs';
import { Web3Type } from './types/web3';
import { migrateUserRegistryContracts } from 'ew-user-registry-contracts';
import { migrateAssetRegistryContracts } from 'ew-asset-registry-contracts';
import { migrateMarketRegistryContracts } from 'ew-market-contracts';
//import { migrateCertificateRegistryContracts, migrateEnergyBundleContracts} from 'ew-origin-contracts'


export const deployEmptyContracts = async() => {

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());

  const Web3 = require('web3');
  const web3: Web3Type = new Web3(connectionConfig.develop.web3);

  //deploy user, asset and market contracts and store instances of lookup contracts
  const userContracts = await migrateUserRegistryContracts((web3 as any))
  const userContractLookup = userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserContractLookup.json']
  const userLogic = userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserLogic.json']
  console.log("User Contract Deployed: " + userContractLookup)

  const assetContracts = await migrateAssetRegistryContracts((web3 as any), userContractLookup)
  const assetContractLookup = assetContracts[process.cwd() + "/node_modules/ew-asset-registry-contracts/dist/contracts/AssetContractLookup.json"]
  const assetProducingRegistryLogic = assetContracts[process.cwd() + "/node_modules/ew-asset-registry-contracts/dist/contracts/AssetProducingRegistryLogic.json"]
  const assetConsumingRegistryLogic = assetContracts[process.cwd() + "/node_modules/ew-asset-registry-contracts/dist/contracts/AssetConsumingRegistryLogic.json"]
  console.log("Asset Contract Deployed: " + assetContractLookup)

  const marketContracts = await migrateMarketRegistryContracts((web3 as any), assetContractLookup)
  const marketContractLookup = marketContracts[process.cwd() + "/node_modules/ew-market-contracts/dist/contracts/MarketContractLookup.json"]
  console.log("Market Contract Deployed: " + marketContractLookup)

  //initialise all contracts
  //migrateContracts already intializes the contracts

  let deployResult = {} as any
  deployResult.userContractLookup = userContractLookup
  deployResult.assetContractLookup = assetContractLookup
  deployResult.userLogic = userLogic
  deployResult.assetConsumingRegistryLogic = assetConsumingRegistryLogic
  deployResult.assetProducingRegistryLogic = assetProducingRegistryLogic

  const writeJsonFile = require('write-json-file')
  await writeJsonFile('contractConfig.json', deployResult)
}

//deployEmptyContracts()
