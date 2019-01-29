import * as fs from 'fs';
import { Web3Type } from './types/web3';
import { migrateUserRegistryContracts } from 'ew-user-registry-contracts';
import { migrateAssetRegistryContracts } from 'ew-asset-registry-contracts';
import { migrateMarketRegistryContracts } from 'ew-market-contracts';
//import { migrateCertificateRegistryContracts, migrateEnergyBundleContracts} from 'ew-origin-contracts'


export const deployEmptyContracts = async() => {

  const configFile = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());

  const Web3 = require('web3');
  const web3: Web3Type = new Web3(configFile.develop.web3);

  const deploymentPK = configFile.develop.deployKey.startsWith('0x') ?
      configFile.develop.deployKey : '0x' + configFile.develop.deployKey;

  const deploymentAccount = web3.eth.accounts.privateKeyToAccount(deploymentPK).address;

  console.log('Deployment Account Created: ' + deploymentAccount);


  //deploy user, asset and market contracts and store instances of lookup contracts
  const userContracts = await migrateUserRegistryContracts((web3 as any))
  const userContractLookup = userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserContractLookup.json']
  console.log("User Contract Deployed: " + userContractLookup)

  const assetContracts = await migrateAssetRegistryContracts((web3 as any), userContractLookup)
  const assetContractLookup = assetContracts[process.cwd() + "/node_modules/ew-asset-registry-contracts/dist/contracts/AssetContractLookup.json"]
  console.log("Asset Contract Deployed: " + assetContractLookup)

  const marketContracts = await migrateMarketRegistryContracts((web3 as any), assetContractLookup)
  const marketContractLookup = marketContracts[process.cwd() + "/node_modules/ew-market-contracts/dist/contracts/MarketContractLookup.json"]
  console.log("Market Contract Deployed: " + marketContractLookup)

  //initialise all contracts
  //migrateContracts already intializes the contracts

  let deployResult = {} as any
  deployResult.userContractLookup = userContractLookup
  deployResult.assetContractLookup = assetContractLookup
  deployResult.marketContractLookup = marketContractLookup

  const writeJsonFile = require('write-json-file')
  await writeJsonFile('contractConfig.json', deployResult)


}

deployEmptyContracts()
