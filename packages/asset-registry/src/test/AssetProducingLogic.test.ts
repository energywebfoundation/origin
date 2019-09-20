import 'mocha';

import {
    buildRights,
    Role,
    UserContractLookup,
    UserLogic
} from '@energyweb/user-registry';
import {
    migrateUserRegistryContracts,
} from '@energyweb/user-registry/contracts';
import { assert } from 'chai';
import * as fs from 'fs';
import moment from 'moment';
import Web3 from 'web3';

import {
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetContractLookupJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON
} from '../../contracts';
import { migrateAssetRegistryContracts } from '../utils/migrateContracts';
import { AssetConsumingDB } from '../wrappedContracts/AssetConsumingDB';
import { AssetConsumingRegistryLogic } from '../wrappedContracts/AssetConsumingRegistryLogic';
import { AssetContractLookup } from '../wrappedContracts/AssetContractLookup';
import { AssetProducingDB } from '../wrappedContracts/AssetProducingDB';
import { AssetProducingRegistryLogic } from '../wrappedContracts/AssetProducingRegistryLogic';

describe('AssetProducingLogic', () => {
    const configFile = JSON.parse(
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
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

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

        const userContractLookupAddr = (userContracts as any).UserContractLookup;

        const deployedContracts = await migrateAssetRegistryContracts(
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
            assert.equal(deployedBytecode, tempBytecode);
        });
    });

    it('should have the right owner', async () => {
        assert.equal(await assetProducingLogic.owner(), assetContractLookup.web3Contract._address);
    });

    it('should have the right userContractLookup', async () => {
        assert.equal(
            await assetProducingLogic.userContractLookup(),
            userContractLookup.web3Contract._address
        );
    });

    it('should have the right userContractLookup', async () => {
        assert.equal(await assetProducingLogic.db(), assetProducingDB.web3Contract._address);
    });

    it('should not have any assets in the contract after deployment', async () => {
        assert.equal(await assetProducingLogic.getAssetListLength(), 0);
    });

    it('should not deploy an asset when the user does not have the assetManager rights as assetManager', async () => {
        let failed = false;
        try {
            await assetProducingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'url',
                2,
                {
                    privateKey: assetOwnerPK
                }
            );
        } catch (ex) {
            failed = true;

            assert.include(ex.message, 'user does not have the required role');
        }
        assert.isTrue(failed);
    });

    it('should not deploy an asset when the user does not have the assetManager rights as user', async () => {
        let failed = false;
        try {
            await assetProducingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'url',
                2,
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }
        assert.isTrue(failed);
    });

    it('should onboard tests-users', async () => {
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

    it('should return empty asset when smart meter is not onboarded yet', async () => {
        const deployedAsset = await assetProducingLogic.getAssetBySmartMeter(assetSmartmeter);

        assert.equal(deployedAsset.length, 2);
        assert.equal(deployedAsset.assetGeneral.length, 9);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.owner, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isFalse(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, '');
        assert.equal(ag.url, '');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should throw when trying to access a non existing AssetGeneral-Struct', async () => {
        let failed = false;
        try {
            await assetProducingLogic.getAssetGeneral(0);
        } catch (ex) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should onboard a new asset', async () => {
        const tx = await assetProducingLogic.createAsset(
            assetSmartmeter,
            assetOwnerAddress,
            true,
            'propertiesDocumentHash',
            'url',
            2,
            { privateKey: privateKeyDeployment }
        );

        const event = (await assetProducingLogic.getAllLogAssetCreatedEvents({
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

    it('should have 1 asset in the list', async () => {
        assert.equal(await assetProducingLogic.getAssetListLength(), 1);
    });

    it('should return the deployed asset correctly', async () => {
        const deployedAsset = await assetProducingLogic.getAssetById(0);

        // producing has 2 properties: maxOwnerChanges + assetGeneralStruct
        assert.equal(deployedAsset.length, 2);
        assert.equal(deployedAsset.maxOwnerChanges, 2);

        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 9);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'url');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should return asset by smart meter correctly', async () => {
        const deployedAsset = await assetProducingLogic.getAssetBySmartMeter(assetSmartmeter);

        assert.equal(deployedAsset.length, 2);
        assert.equal(deployedAsset.maxOwnerChanges, 2);

        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 9);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'url');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should return assetGeneral correctly', async () => {
        const ag = await assetProducingLogic.getAssetGeneral(0);
        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'url');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should fail when trying to log with saveSmartMeterRead using the wrong smart meter', async () => {
        let failed = false;

        try {
            await assetProducingLogic.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', 0, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: wrong sender');
        }

        assert.isTrue(failed);
    });

    it('should be able log to with saveSmartMeterRead with the right account', async () => {
        const TIMESTAMP = moment().unix();
        const tx = await assetProducingLogic.saveSmartMeterRead(
            0,
            100,
            'lastSmartMeterReadFileHash',
            TIMESTAMP,
            { privateKey: assetSmartmeterPK }
        );

        const event = (await assetProducingLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogNewMeterRead');

        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '0',
            2: '100',
            3: TIMESTAMP.toString(),
            _assetId: '0',
            _oldMeterRead: '0',
            _newMeterRead: '100',
            _timestamp: TIMESTAMP.toString()
        });
    });

    it('should fail when trying to log with saveSmartMeterRead and a too low meter reading', async () => {
        let failed = false;

        try {
            await assetProducingLogic.saveSmartMeterRead(0, 50, 'lastSmartMeterReadFileHash', 0, {
                privateKey: assetSmartmeterPK
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: meterread too low');
        }

        assert.isTrue(failed);
    });

    it('should be able to log with saveSmartMeterRead again using the right values', async () => {
        const TIMESTAMP = moment().unix();

        const tx = await assetProducingLogic.saveSmartMeterRead(
            0,
            200,
            'lastSmartMeterReadFileHash#2',
            TIMESTAMP,
            { privateKey: assetSmartmeterPK }
        );

        const event = (await assetProducingLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogNewMeterRead');

        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '100',
            2: '200',
            3: TIMESTAMP.toString(),
            _assetId: '0',
            _oldMeterRead: '100',
            _newMeterRead: '200',
            _timestamp: TIMESTAMP.toString()
        });
    });

    it('should fail when trying to deactivate an asset as non-manager', async () => {
        let failed = false;

        try {
            await assetProducingLogic.setActive(0, false, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate an asset', async () => {
        const tx = await assetProducingLogic.setActive(0, false, {
            privateKey: privateKeyDeployment
        });

        const eventActive = await assetProducingLogic.getAllLogAssetSetActiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        });

        assert.equal(eventActive.length, 0);

        const eventInactive = (await assetProducingLogic.getAllLogAssetSetInactiveEvents({
            fromBlock: tx.blockNumber - 1,
            toBlock: tx.blockNumber + 1
        }))[0];

        assert.equal(eventInactive.event, 'LogAssetSetInactive');
        assert.deepEqual(eventInactive.returnValues, {
            0: '0',
            _assetId: '0'
        });
    });

    it('should fail when trying to log with saveSmartMeterRead with a deactivated asset', async () => {
        let failed = false;

        try {
            await assetProducingLogic.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash', 0, {
                privateKey: assetSmartmeterPK
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: asset not active');
        }

        assert.isTrue(failed);
    });

    it('should fail when trying to active an asset as non-manager', async () => {
        let failed = false;

        try {
            await assetProducingLogic.setActive(0, true, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate an asset', async () => {
        const tx = await assetProducingLogic.setActive(0, true, {
            privateKey: privateKeyDeployment
        });

        const eventActive = await assetProducingLogic.getAllLogAssetSetInactiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        });
        assert.equal(eventActive.length, 0);
        const eventInactive = (await assetProducingLogic.getAllLogAssetSetActiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(eventInactive.event, 'LogAssetSetActive');
        assert.deepEqual(eventInactive.returnValues, {
            0: '0',
            _assetId: '0'
        });
    });

    it('should fail when trying to call update', async () => {
        let failed = false;

        try {
            await assetProducingLogic.update('0x7110d0f07be70fc2a6c84fe66bf128593b2102fb', {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should return 0x0 when an asset does not have a marketLogicContractLookup-address set', async () => {
        assert.equal(
            await assetProducingLogic.getMarketLookupContract(0),
            '0x0000000000000000000000000000000000000000'
        );
    });

    it('should fail trying to set marketAddress as admin', async () => {
        let failed = false;

        try {
            await assetProducingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'sender is not the assetOwner');
        }

        assert.isTrue(failed);
    });

    it('should fail trying to set marketAddress as random user', async () => {
        let failed = false;

        try {
            await assetProducingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                { privateKey: assetSmartmeter2PK }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'sender is not the assetOwner');
        }

        assert.isTrue(failed);
    });

    it('should fail trying to set marketAddress as admin', async () => {
        let failed = false;

        try {
            await assetProducingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'sender is not the assetOwner');
        }

        assert.isTrue(failed);
    });

    it('should set marketAddress', async () => {
        await assetProducingLogic.setMarketLookupContract(
            0,
            '0x1000000000000000000000000000000000000005',
            { privateKey: assetOwnerPK }
        );

        assert.equal(
            await assetProducingLogic.getMarketLookupContract(0),
            '0x1000000000000000000000000000000000000005'
        );
    });

    it('should return updated assetGeneral correctly', async () => {
        const ag = await assetProducingLogic.getAssetGeneral(0);

        assert.deepEqual(ag, {
            0: assetSmartmeter,
            1: assetOwnerAddress,
            2: '200',
            3: true,
            4: 'lastSmartMeterReadFileHash#2',
            5: 'propertiesDocumentHash',
            6: 'url',
            7: '0x1000000000000000000000000000000000000005',
            8: false,
            smartMeter: assetSmartmeter,
            owner: assetOwnerAddress,
            lastSmartMeterReadWh: '200',
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash#2',
            propertiesDocumentHash: 'propertiesDocumentHash',
            url: 'url',
            marketLookupContract: '0x1000000000000000000000000000000000000005',
            bundled: false
        });
    });

    it('should fail when trying to activate a non existing bundle', async () => {
        let failed = false;
        try {
            await assetProducingLogic.setBundleActive(3, true, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should fail when trying to activate an existing bundle as admin', async () => {
        let failed = false;
        try {
            await assetProducingLogic.setBundleActive(0, true, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'setBundleActive: not the owner');
        }

        assert.isTrue(failed);
    });

    it('should fail when trying to activate an existing bundle as trader', async () => {
        let failed = false;
        try {
            await assetProducingLogic.setBundleActive(0, true, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'setBundleActive: not the owner');
        }

        assert.isTrue(failed);
    });

    it('should activate an existing bundle as assetOwner', async () => {
        await assetProducingLogic.setBundleActive(0, true, {
            privateKey: assetOwnerPK
        });

        let ag = await assetProducingLogic.getAssetGeneral(0);

        assert.deepEqual(ag, {
            0: assetSmartmeter,
            1: assetOwnerAddress,
            2: '200',
            3: true,
            4: 'lastSmartMeterReadFileHash#2',
            5: 'propertiesDocumentHash',
            6: 'url',
            7: '0x1000000000000000000000000000000000000005',
            8: true,
            smartMeter: assetSmartmeter,
            owner: assetOwnerAddress,
            lastSmartMeterReadWh: '200',
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash#2',
            propertiesDocumentHash: 'propertiesDocumentHash',
            url: 'url',
            marketLookupContract: '0x1000000000000000000000000000000000000005',
            bundled: true
        });

        const deployedAsset = await assetProducingLogic.getAssetById(0);

        // producing has 2 properties: maxOwnerChanges + assetGeneralStruct
        assert.equal(deployedAsset.length, 2);
        assert.equal(deployedAsset.maxOwnerChanges, 2);

        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 9);

        ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'lastSmartMeterReadFileHash#2');
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'url');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isTrue(ag.bundled);
    });

    it('should return the correct latest hashes + meter readings', async () => {
        assert.deepEqual(await assetProducingLogic.getLastMeterReadingAndHash(0), {
            0: '200',
            1: 'lastSmartMeterReadFileHash#2',
            _lastSmartMeterReadWh: '200',
            _lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash#2'
        });

        it('should fail when trying to return latest hash + meter reading of a non existing asset', async () => {
            let failed = false;

            try {
                await assetProducingLogic.getLastMeterReadingAndHash(1);
            } catch (ex) {
                failed = true;
            }
            assert.isTrue(failed);
        });
    });
});
