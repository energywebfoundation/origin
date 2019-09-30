import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import {
    UserContractLookup,
    UserLogic,
    buildRights,
    Role
} from '@energyweb/user-registry';
import {
    migrateUserRegistryContracts
} from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '../utils/migrateContracts';
import { AssetContractLookup } from '../wrappedContracts/AssetContractLookup';
import { AssetProducingRegistryLogic } from '../wrappedContracts/AssetProducingRegistryLogic';
import { AssetConsumingRegistryLogic } from '../wrappedContracts/AssetConsumingRegistryLogic';
import { AssetConsumingDB } from '../wrappedContracts/AssetConsumingDB';
import { AssetProducingDB } from '../wrappedContracts/AssetProducingDB';
import {
    AssetContractLookupJSON,
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON
} from '../../contracts';
import moment from 'moment';

describe('AssetConsumingLogic', () => {
    const configFile: any = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3: Web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let userLogic: UserLogic;
    let userContractLookup: UserContractLookup;
    let assetContractLookup: AssetContractLookup;
    let assetProducingLogic: AssetProducingRegistryLogic;
    let assetConsumingLogic: AssetConsumingRegistryLogic;
    let assetProducingDB: AssetProducingDB;
    let assetConsumingDB: AssetConsumingDB;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    it('should deploy the contracts', async () => {
        const userContracts: any = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            accountDeployment,
            buildRights([Role.UserAdmin, Role.AssetAdmin]),
            {
                privateKey: privateKeyDeployment
            }
        );

        const userContractLookupAddr: string = (userContracts as any).UserContractLookup;

        const deployedContracts: any = await migrateAssetRegistryContracts(
            web3,
            userContractLookupAddr,
            privateKeyDeployment
        );

        userContractLookup = new UserContractLookup(web3 as any, userContractLookupAddr);

        Object.keys(deployedContracts).forEach(async key => {
            let tempBytecode;
            if (key.includes('AssetContractLookup')) {
                assetContractLookup = new AssetContractLookup(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetContractLookupJSON as any).deployedBytecode;
            }

            if (key.includes('AssetConsumingDB')) {
                assetConsumingDB = new AssetConsumingDB(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetConsumingDBJSON as any).deployedBytecode;
            }

            if (key.includes('AssetConsumingRegistryLogic')) {
                assetConsumingLogic = new AssetConsumingRegistryLogic(
                    web3 as any,
                    deployedContracts[key]
                );
                tempBytecode = (AssetConsumingRegistryLogicJSON as any).deployedBytecode;
            }

            if (key.includes('AssetProducingDB')) {
                assetProducingDB = new AssetProducingDB(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetProducingDBJSON as any).deployedBytecode;
            }

            if (key.includes('AssetProducingRegistryLogic')) {
                assetProducingLogic = new AssetProducingRegistryLogic(
                    web3 as any,
                    deployedContracts[key]
                );
                tempBytecode = (AssetProducingRegistryLogicJSON as any).deployedBytecode;
            }

            const deployedBytecode = await web3.eth.getCode(deployedContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            // const tempBytecode = contractInfo.deployedBytecode;
            assert.equal(deployedBytecode, tempBytecode);
        });
    });

    it('should have the right owner', async () => {
        assert.equal(await assetConsumingLogic.owner(), assetContractLookup.web3Contract.options.address);
    });

    it('should have the right userContractLookup', async () => {
        assert.equal(
            await assetConsumingLogic.userContractLookup(),
            userContractLookup.web3Contract.options.address
        );
    });

    it('should have the right db', async () => {
        assert.equal(await assetConsumingLogic.db(), assetConsumingDB.web3Contract.options.address);
    });

    it('should not have any assets in the contract after deployment', async () => {
        assert.equal(await assetConsumingLogic.getAssetListLength(), 0);
    });

    it('should not deploy an asset when the user does not have the assetManager rights as assetManager', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'urlString',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            assert.include(ex.message, 'user does not have the required role');

            failed = true;
        }
        assert.isTrue(failed);
    });

    it('should not deploy an asset when the user does not have the assetManager rights as user', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'urlString',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            assert.include(ex.message, 'user does not have the required role');
            failed = true;
        }
        assert.isTrue(failed);
    });

    it('should onboard tests-users', async () => {
        const userLogicAddress = await userContractLookup.userRegistry();

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            assetOwnerAddress,
            'assetOwner',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(
            assetOwnerAddress,
            buildRights([Role.AssetManager, Role.AssetAdmin]),
            {
                privateKey: privateKeyDeployment
            }
        );
    });

    it('should not deploy an asset as user', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'urlString',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            assert.include(ex.message, 'user does not have the required role');
            failed = true;
        }
        assert.isTrue(failed);
    });

    it('should return empty asset', async () => {
        const emptyAsset = await assetConsumingLogic.getAssetBySmartMeter(assetSmartmeter);

        // all the properties are in 1 struct
        assert.equal(emptyAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(emptyAsset.assetGeneral.length, 8);

        const ag = emptyAsset.assetGeneral;

        assert.equal(ag.smartMeter, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.owner, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isFalse(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, '');
        assert.equal(ag.url, '');
        assert.isFalse(ag.bundled);
    });

    it('should onboard a new asset', async () => {
        const tx = await assetConsumingLogic.createAsset(
            assetSmartmeter,
            assetOwnerAddress,
            true,
            'propertiesDocumentHash',
            'urlString',
            { privateKey: privateKeyDeployment }
        );

        const event = (await assetConsumingLogic.getAllLogAssetCreatedEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogAssetCreated');
        assert.deepEqual(event.returnValues, {
            0: accountDeployment,
            1: '0',
            _sender: accountDeployment,
            _assetId: '0'
        });
    });

    it('should fail when trying to onboard a new asset with same smartmeter', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'urlString',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            assert.include(ex.message, 'smartmeter does already exist');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should have 1 asset in the list', async () => {
        assert.equal(await assetConsumingLogic.getAssetListLength(), 1);
    });

    it('should return asset by smartmeter', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetBySmartMeter(assetSmartmeter);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should return the deployed asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should fail when trying to log with the wrong smartmeter', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.saveSmartMeterRead(0, 100, 'newMeterReadFileHash', 0, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            assert.include(ex.message, 'saveSmartMeterRead: wrong sender');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should be able to log new meterread with the right account', async () => {
        const tx = await assetConsumingLogic.saveSmartMeterRead(0, 100, 'newMeterReadFileHash', 0, {
            privateKey: assetSmartmeterPK
        });

        const event = (await assetConsumingLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogNewMeterRead');

        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '0',
            2: '100',
            3: event.returnValues._timestamp,
            _assetId: '0',
            _oldMeterRead: '0',
            _newMeterRead: '100',
            _timestamp: event.returnValues._timestamp
        });
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 100);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should fail when trying to log with a too low new meterreading', async () => {
        let failed = false;

        try {
            const tx = await assetConsumingLogic.saveSmartMeterRead(
                0,
                100,
                'newMeterReadFileHash',
                0,
                { privateKey: assetSmartmeterPK }
            );
        } catch (ex) {
            assert.include(ex.message, 'saveSmartMeterRead: meterread too low');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should log with a new meterreading', async () => {
        const tx = await assetConsumingLogic.saveSmartMeterRead(0, 200, 'newMeterReadFileHash', 0, {
            privateKey: assetSmartmeterPK
        });

        const event = (await assetConsumingLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];
        const TIMESTAMP = moment().unix();

        assert.equal(event.event, 'LogNewMeterRead');
        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '100',
            2: '200',
            3: event.returnValues._timestamp,
            _assetId: '0',
            _oldMeterRead: '100',
            _newMeterRead: '200',
            _timestamp: event.returnValues._timestamp
        });
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 8);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.isFalse(ag.bundled);
    });
});
