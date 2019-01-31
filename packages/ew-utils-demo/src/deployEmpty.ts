import * as fs from 'fs';
import { Web3Type } from './types/web3';
import { migrateUserRegistryContracts } from 'ew-user-registry-contracts';
import { migrateAssetRegistryContracts } from 'ew-asset-registry-contracts';

export const deployEmptyContracts = async() => {

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());

  const Web3 = require('web3');
  const web3 = new Web3(connectionConfig.develop.web3);

  const adminPK = connectionConfig.develop.deployKey.startsWith('0x') ?
      connectionConfig.develop.deployKey : '0x' + connectionConfig.develop.deployKey;

  console.log("-----------------------------------------------------------")

  //deploy user, asset and market contracts and store instances of lookup contracts
  const userContracts = await migrateUserRegistryContracts((web3 as any), adminPK)
  const userContractLookup = userContracts["UserContractLookup"]
  const userLogic = userContracts["UserLogic"]
  console.log("User Contract Deployed: " + userContractLookup)

  const assetContracts = await migrateAssetRegistryContracts((web3 as any), userContractLookup, adminPK)
  const assetContractLookup = assetContracts["AssetContractLookup"]
  const assetProducingRegistryLogic = assetContracts["AssetProducingRegistryLogic"]
  const assetConsumingRegistryLogic = assetContracts["AssetConsumingRegistryLogic"]
  console.log("Asset Contract Deployed: " + assetContractLookup)

  console.log("-----------------------------------------------------------\n")

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
