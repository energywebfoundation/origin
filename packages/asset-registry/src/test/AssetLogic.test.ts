import 'mocha';
import { assert } from 'chai';
import * as fs from 'fs';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { buildRights, Role, UserLogic } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';

import { migrateAssetRegistryContracts } from '../utils/migrateContracts';
import { AssetLogic } from '../wrappedContracts/AssetLogic';

describe('AssetLogic', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let userLogic: UserLogic;
    let assetLogic: AssetLogic;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    it('should deploy the contracts', async () => {
        userLogic = await migrateUserRegistryContracts(web3, privateKeyDeployment);

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
            { privateKey: privateKeyDeployment }
        );

        assetLogic = await migrateAssetRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );
    });

    it('should not have any assets in the contract after deployment', async () => {
        assert.equal(await assetLogic.getAssetListLength(), 0);
    });

    it('should not deploy an asset when the user does not have the assetManager rights as assetManager', async () => {
        let failed = false;
        try {
            await assetLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'url',
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
            await assetLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                'propertiesDocumentHash',
                'url',
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
        const deployedAsset = await assetLogic.getAssetBySmartMeter(assetSmartmeter);

        assert.equal(deployedAsset.length, 7);

        assert.equal(deployedAsset.smartMeter, '0x0000000000000000000000000000000000000000');
        assert.equal(deployedAsset.owner, '0x0000000000000000000000000000000000000000');
        assert.equal(deployedAsset.lastSmartMeterReadWh, 0);
        assert.isFalse(deployedAsset.active);
        assert.equal(deployedAsset.lastSmartMeterReadFileHash, '');
        assert.equal(deployedAsset.propertiesDocumentHash, '');
        assert.equal(deployedAsset.url, '');
    });

    it('should onboard a new asset', async () => {
        const tx = await assetLogic.createAsset(
            assetSmartmeter,
            assetOwnerAddress,
            true,
            'propertiesDocumentHash',
            'url',
            { privateKey: privateKeyDeployment }
        );

        const event = (await assetLogic.getAllLogAssetCreatedEvents({
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
        assert.equal(await assetLogic.getAssetListLength(), 1);
    });

    it('should return the deployed asset correctly', async () => {
        const deployedAsset = await assetLogic.getAssetById(0);

        assert.equal(deployedAsset.length, 7);

        assert.equal(deployedAsset.smartMeter, assetSmartmeter);
        assert.equal(deployedAsset.owner, assetOwnerAddress);
        assert.equal(deployedAsset.lastSmartMeterReadWh, 0);
        assert.isTrue(deployedAsset.active);
        assert.equal(deployedAsset.lastSmartMeterReadFileHash, '');
        assert.equal(deployedAsset.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(deployedAsset.url, 'url');
    });

    it('should return asset by smart meter correctly', async () => {
        const deployedAsset = await assetLogic.getAssetBySmartMeter(assetSmartmeter);

        assert.equal(deployedAsset.length, 7);

        assert.equal(deployedAsset.smartMeter, assetSmartmeter);
        assert.equal(deployedAsset.owner, assetOwnerAddress);
        assert.equal(deployedAsset.lastSmartMeterReadWh, 0);
        assert.isTrue(deployedAsset.active);
        assert.equal(deployedAsset.lastSmartMeterReadFileHash, '');
        assert.equal(deployedAsset.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(deployedAsset.url, 'url');
    });

    it('should return asset by ID correctly', async () => {
        const asset0 = await assetLogic.getAssetById(0);

        assert.equal(asset0.smartMeter, assetSmartmeter);
        assert.equal(asset0.owner, assetOwnerAddress);
        assert.equal(asset0.lastSmartMeterReadWh, 0);
        assert.isTrue(asset0.active);
        assert.equal(asset0.lastSmartMeterReadFileHash, '');
        assert.equal(asset0.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(asset0.url, 'url');
    });

    it('should fail when trying to log with saveSmartMeterRead using the wrong smart meter', async () => {
        let failed = false;

        try {
            await assetLogic.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', 0, {
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
        const tx = await assetLogic.saveSmartMeterRead(
            0,
            100,
            'lastSmartMeterReadFileHash',
            TIMESTAMP,
            { privateKey: assetSmartmeterPK }
        );

        const event = (await assetLogic.getAllLogNewMeterReadEvents({
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
            await assetLogic.saveSmartMeterRead(0, 50, 'lastSmartMeterReadFileHash', 0, {
                privateKey: assetSmartmeterPK
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: meter read too low');
        }

        assert.isTrue(failed);
    });

    it('should be able to log with saveSmartMeterRead again using the right values', async () => {
        const TIMESTAMP = moment().unix();

        const tx = await assetLogic.saveSmartMeterRead(
            0,
            200,
            'lastSmartMeterReadFileHash#2',
            TIMESTAMP,
            { privateKey: assetSmartmeterPK }
        );

        const event = (await assetLogic.getAllLogNewMeterReadEvents({
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
            await assetLogic.setActive(0, false, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate an asset', async () => {
        const tx = await assetLogic.setActive(0, false, {
            privateKey: privateKeyDeployment
        });

        const eventActive = await assetLogic.getAllLogAssetSetActiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        });

        assert.equal(eventActive.length, 0);

        const eventInactive = (await assetLogic.getAllLogAssetSetInactiveEvents({
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
            await assetLogic.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash', 0, {
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
            await assetLogic.setActive(0, true, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate an asset', async () => {
        const tx = await assetLogic.setActive(0, true, {
            privateKey: privateKeyDeployment
        });

        const eventActive = await assetLogic.getAllLogAssetSetInactiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        });
        assert.equal(eventActive.length, 0);
        const eventInactive = (await assetLogic.getAllLogAssetSetActiveEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(eventInactive.event, 'LogAssetSetActive');
        assert.deepEqual(eventInactive.returnValues, {
            0: '0',
            _assetId: '0'
        });
    });

    it('should return updated asset correctly', async () => {
        const asset0 = await assetLogic.getAssetById(0);

        assert.equal(asset0.smartMeter, assetSmartmeter);
        assert.equal(asset0.owner, assetOwnerAddress);
        assert.equal(asset0.lastSmartMeterReadWh, '200');
        assert.isTrue(asset0.active);
        assert.equal(asset0.lastSmartMeterReadFileHash, 'lastSmartMeterReadFileHash#2');
        assert.equal(asset0.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(asset0.url, 'url');
    });

    it('should return the correct latest hashes + meter readings', async () => {
        assert.deepEqual(await assetLogic.getLastMeterReadingAndHash(0), {
            0: '200',
            1: 'lastSmartMeterReadFileHash#2',
            _lastSmartMeterReadWh: '200',
            _lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash#2'
        });

        it('should fail when trying to return latest hash + meter reading of a non existing asset', async () => {
            let failed = false;

            try {
                await assetLogic.getLastMeterReadingAndHash(1);
            } catch (ex) {
                failed = true;
            }
            assert.isTrue(failed);
        });
    });
    
    it('should return user registry address', async () => {
        const userLogicAddress = await assetLogic.userLogicAddress();

        assert.equal(userLogicAddress, userLogic.web3Contract.options.address);
    });
});
