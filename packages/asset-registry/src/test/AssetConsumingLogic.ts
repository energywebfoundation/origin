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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import {
    UserContractLookup,
    UserLogic,
    migrateUserRegistryContracts,
    buildRights,
    Role
} from '@energyweb/user-registry';
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
} from '..';
import moment from 'moment';

describe('AssetConsumingLogic', () => {
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

    const matcherPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const matcher = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    it('should deploy the contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.setUser(accountDeployment, 'admin', {
            privateKey: privateKeyDeployment
        });

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

            // const tempBytecode = contractInfo.deployedBytecode;
            assert.equal(deployedBytecode, tempBytecode);
        });
    });

    it('should have the right owner', async () => {
        assert.equal(await assetConsumingLogic.owner(), assetContractLookup.web3Contract._address);
    });

    it('should have the right userContractLookup', async () => {
        assert.equal(
            await assetConsumingLogic.userContractLookup(),
            userContractLookup.web3Contract._address
        );
    });

    it('should have the right db', async () => {
        assert.equal(await assetConsumingLogic.db(), assetConsumingDB.web3Contract._address);
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
                [matcher] as any,
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
                [matcher] as any,
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

        await userLogic.setUser(assetOwnerAddress, 'assetOwner', {
            privateKey: privateKeyDeployment
        });
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
                [matcher] as any,
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
        assert.equal(emptyAsset.assetGeneral.length, 10);

        const ag = emptyAsset.assetGeneral;

        assert.equal(ag.smartMeter, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.owner, '0x0000000000000000000000000000000000000000');
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isFalse(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.deepEqual(ag.matcher, []);
        assert.equal(ag.propertiesDocumentHash, '');
        assert.equal(ag.url, '');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should onboard a new asset', async () => {
        const tx = await assetConsumingLogic.createAsset(
            assetSmartmeter,
            assetOwnerAddress,
            true,
            [matcher] as any,
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
                [matcher] as any,
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
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.deepEqual(ag.matcher, [matcher]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should return the deployed asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.deepEqual(ag.matcher, [matcher]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
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
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 100);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, [matcher]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
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
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, [matcher]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });

    it('should return 0x0 when an asset does not have a marketLogicContractLookup-address set', async () => {
        assert.equal(
            await assetConsumingLogic.getMarketLookupContract(0),
            '0x0000000000000000000000000000000000000000'
        );
    });

    it('should fail trying to set marketAddress as admin', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            assert.include(ex.message, 'sender is not the assetOwner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should fail trying to set marketAddress as random user', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                { privateKey: matcherPK }
            );
        } catch (ex) {
            assert.include(ex.message, 'sender is not the assetOwner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should fail trying to set marketAddress as admin', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.setMarketLookupContract(
                0,
                '0x1000000000000000000000000000000000000005',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            assert.include(ex.message, 'sender is not the assetOwner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should set marketAddress', async () => {
        await assetConsumingLogic.setMarketLookupContract(
            0,
            '0x1000000000000000000000000000000000000005',
            { privateKey: assetOwnerPK }
        );

        assert.equal(
            await assetConsumingLogic.getMarketLookupContract(0),
            '0x1000000000000000000000000000000000000005'
        );
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, [matcher]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isFalse(ag.bundled);
    });

    it('should not add a matcher as admin', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.addMatcher(0, '0x1000000000000000000000000000000000000000', {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            assert.include(ex.message, 'addMatcher: not the owner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should not add a matcher as random user', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.addMatcher(0, '0x1000000000000000000000000000000000000000', {
                privateKey: matcherPK
            });
        } catch (ex) {
            assert.include(ex.message, 'addMatcher: not the owner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should add a matcher', async () => {
        await assetConsumingLogic.addMatcher(0, '0x1000000000000000000000000000000000000000', {
            privateKey: assetOwnerPK
        });
        const matcherArray = await assetConsumingLogic.getMatcher(0);
        assert.deepEqual(matcherArray, [matcher, '0x1000000000000000000000000000000000000000']);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, [matcher, '0x1000000000000000000000000000000000000000']);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isFalse(ag.bundled);
    });

    it('should not remove a matcher as admin', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.removeMatcher(0, matcher, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            assert.include(ex.message, 'removeMatcher: not the owner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should not remove a matcher as random user', async () => {
        let failed = false;

        try {
            await assetConsumingLogic.removeMatcher(0, matcher, {
                privateKey: matcherPK
            });
        } catch (ex) {
            assert.include(ex.message, 'removeMatcher: not the owner');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should remove a matcher', async () => {
        await assetConsumingLogic.removeMatcher(0, matcher, {
            privateKey: assetOwnerPK
        });
        const matcherArray = await assetConsumingLogic.getMatcher(0);

        assert.deepEqual(matcherArray, ['0x1000000000000000000000000000000000000000']);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, ['0x1000000000000000000000000000000000000000']);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isFalse(ag.bundled);
    });

    it('should not remove a non existing-matcher', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.removeMatcher(0, matcher, {
                privateKey: assetOwnerPK
            });
        } catch (ex) {
            assert.include(ex.message, 'removeMatcher: address not found');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should remove remaining matcher', async () => {
        await assetConsumingLogic.removeMatcher(0, '0x1000000000000000000000000000000000000000', {
            privateKey: assetOwnerPK
        });
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, []);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isFalse(ag.bundled);
    });

    it('should add more matcher', async () => {
        for (let i = 0; i < 10; i++) {
            await assetConsumingLogic.addMatcher(
                0,
                '0x100000000000000000000000000000000000000' + i,
                { privateKey: assetOwnerPK }
            );
        }

        const matcherArray = await assetConsumingLogic.getMatcher(0);
        assert.deepEqual(matcherArray, [
            '0x1000000000000000000000000000000000000000',
            '0x1000000000000000000000000000000000000001',
            '0x1000000000000000000000000000000000000002',
            '0x1000000000000000000000000000000000000003',
            '0x1000000000000000000000000000000000000004',
            '0x1000000000000000000000000000000000000005',
            '0x1000000000000000000000000000000000000006',
            '0x1000000000000000000000000000000000000007',
            '0x1000000000000000000000000000000000000008',
            '0x1000000000000000000000000000000000000009'
        ]);
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(0);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartmeter);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 200);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, 'newMeterReadFileHash');
        assert.deepEqual(ag.matcher, [
            '0x1000000000000000000000000000000000000000',
            '0x1000000000000000000000000000000000000001',
            '0x1000000000000000000000000000000000000002',
            '0x1000000000000000000000000000000000000003',
            '0x1000000000000000000000000000000000000004',
            '0x1000000000000000000000000000000000000005',
            '0x1000000000000000000000000000000000000006',
            '0x1000000000000000000000000000000000000007',
            '0x1000000000000000000000000000000000000008',
            '0x1000000000000000000000000000000000000009'
        ]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(ag.url, 'urlString');
        assert.equal(ag.marketLookupContract, '0x1000000000000000000000000000000000000005');
        assert.isFalse(ag.bundled);
    });

    it('should not add a 10th matcher', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.addMatcher(0, '0x1000000000000000000000000000000000000010', {
                privateKey: assetOwnerPK
            });
        } catch (ex) {
            assert.include(ex.message, 'addMatcher: too many matcher already');

            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should remove all 10 matcher', async () => {
        for (let i = 9; i >= 0; i--) {
            await assetConsumingLogic.removeMatcher(
                0,
                '0x100000000000000000000000000000000000000' + i,
                { privateKey: assetOwnerPK }
            );
        }

        const matcherArray = await assetConsumingLogic.getMatcher(0);
        assert.deepEqual(matcherArray, []);
    });

    it('should not onboard assets with too many matcher', async () => {
        let failed = false;
        try {
            await assetConsumingLogic.createAsset(
                assetSmartmeter,
                assetOwnerAddress,
                true,
                [
                    '0x1000000000000000000000000000000000000000',
                    '0x1000000000000000000000000000000000000001',
                    '0x1000000000000000000000000000000000000002',
                    '0x1000000000000000000000000000000000000003',
                    '0x1000000000000000000000000000000000000004',
                    '0x1000000000000000000000000000000000000005',
                    '0x1000000000000000000000000000000000000006',
                    '0x1000000000000000000000000000000000000007',
                    '0x1000000000000000000000000000000000000008',
                    '0x1000000000000000000000000000000000000009',
                    '0x1000000000000000000000000000000000000010'
                ] as any,
                'propertiesDocumentHash',
                'urlString',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'addMatcher: too many matcher already');
        }
        assert.isTrue(failed);
    });

    it('should onboard assets with 10 matcher', async () => {
        const tx = await assetConsumingLogic.createAsset(
            assetSmartMeter2,
            assetOwnerAddress,
            true,
            [
                '0x1000000000000000000000000000000000000000',
                '0x1000000000000000000000000000000000000001',
                '0x1000000000000000000000000000000000000002',
                '0x1000000000000000000000000000000000000003',
                '0x1000000000000000000000000000000000000004',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000006',
                '0x1000000000000000000000000000000000000007',
                '0x1000000000000000000000000000000000000008',
                '0x1000000000000000000000000000000000000009'
            ] as any,
            'propertiesDocumentHash#2',
            'urlString#2',
            { privateKey: privateKeyDeployment }
        );

        const event = (await assetConsumingLogic.getAllLogAssetCreatedEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogAssetCreated');
        assert.deepEqual(event.returnValues, {
            0: accountDeployment,
            1: '1',
            _sender: accountDeployment,
            _assetId: '1'
        });
    });

    it('should return the updated asset correctly', async () => {
        const deployedAsset = await assetConsumingLogic.getAssetById(1);

        // all the properties are in 1 struct
        assert.equal(deployedAsset.length, 1);
        // checking the number of properties in assetGeneral
        assert.equal(deployedAsset.assetGeneral.length, 10);

        const ag = deployedAsset.assetGeneral;

        assert.equal(ag.smartMeter, assetSmartMeter2);
        assert.equal(ag.owner, assetOwnerAddress);
        assert.equal(ag.lastSmartMeterReadWh, 0);
        assert.isTrue(ag.active);
        assert.equal(ag.lastSmartMeterReadFileHash, '');
        assert.deepEqual(ag.matcher, [
            '0x1000000000000000000000000000000000000000',
            '0x1000000000000000000000000000000000000001',
            '0x1000000000000000000000000000000000000002',
            '0x1000000000000000000000000000000000000003',
            '0x1000000000000000000000000000000000000004',
            '0x1000000000000000000000000000000000000005',
            '0x1000000000000000000000000000000000000006',
            '0x1000000000000000000000000000000000000007',
            '0x1000000000000000000000000000000000000008',
            '0x1000000000000000000000000000000000000009'
        ]);
        assert.equal(ag.propertiesDocumentHash, 'propertiesDocumentHash#2');
        assert.equal(ag.url, 'urlString#2');
        assert.equal(ag.marketLookupContract, '0x0000000000000000000000000000000000000000');
        assert.isFalse(ag.bundled);
    });
});
