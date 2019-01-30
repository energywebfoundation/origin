import * as fs from 'fs';
import { Web3Type } from './types/web3';
import { deployEmptyContracts } from './deployEmpty'
import { UserContractLookup, UserLogic } from 'ew-user-registry-contracts';
import * as User from 'ew-user-registry-lib'
import { AssetContractLookup, AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';
import * as Asset from 'ew-asset-registry-lib'

export const onboard = async() => {

  await deployEmptyContracts()

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());
  const demoConfig = JSON.parse(fs.readFileSync(process.cwd() + '/demo-config.json', 'utf8').toString());
  const contractConfig = JSON.parse(fs.readFileSync(process.cwd() + '/contractConfig.json', 'utf8').toString());

  const Web3 = require('web3');
  const web3: Web3Type = new Web3(connectionConfig.develop.web3);

  const adminPK = demoConfig.topAdminPrivateKey.startsWith('0x') ?
      demoConfig.topAdminPrivateKey : '0x' + demoConfig.topAdminPrivateKey;

  const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

  //create logic instances
  const userLogic = new UserLogic((web3 as any), contractConfig.userLogic)
  const assetProducingRegistryLogic = new AssetProducingRegistryLogic((web3 as any), contractConfig.assetProducingRegistryLogic)
  const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic((web3 as any), contractConfig.assetConsumingRegistryLogic)

  //onboard users
  const numUsers = 10

  for(let i = 0; i<numUsers; i++) {

    const newUserAccount = web3.eth.accounts.create()

    await userLogic.setUser(newUserAccount.address, 'Slock.it GmbH', { privateKey: adminPK })
    await userLogic.setRoles(newUserAccount.address, 0, { privateKey: adminPK } )

    console.log("Onboarded a new user: " + newUserAccount.address)

  }

  // //onboard assets
  // const assetProps: Asset.ProducingAsset.OnChainProperties = {
  //     certificatesUsedForWh: 0,
  //     smartMeter: { address: assetSmartmeter },
  //     owner: { address: accountDeployment },
  //     lastSmartMeterReadWh: 0,
  //     active: true,
  //     lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
  //     matcher: [{ address: matcher }],
  //     propertiesDocumentHash: null,
  //     url: null,
  //     certificatesCreatedForWh: 0,
  //     lastSmartMeterCO2OffsetRead: 0,
  //     maxOwnerChanges: 3,
  // };
  //
  // const assetPropsOffChain: Asset.ProducingAsset.OffChainProperties = {
  //     operationalSince: 0,
  //     capacityWh: 10,
  //     country: 'USA',
  //     region: 'AnyState',
  //     zip: '012345',
  //     city: 'Anytown',
  //     street: 'Main-Street',
  //     houseNumber: '42',
  //     gpsLatitude: '0.0123123',
  //     gpsLongitude: '31.1231',
  //     assetType: Asset.ProducingAsset.Type.Wind,
  //     complianceRegistry: Asset.ProducingAsset.Compliance.EEC,
  //     otherGreenAttributes: '',
  //     typeOfPublicSupport: '',
  // };

  //off chain storage
}

onboard()
