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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuechler@slock.it

import { assert } from 'chai';
import * as fs from 'fs';

import 'mocha';
import { Web3Type } from '../types/web3';
import * as GeneralLib from 'ew-utils-general-lib';
import { logger } from '../Logger';
import { UserContractLookup, UserLogic, migrateUserRegistryContracts } from 'ew-user-registry-contracts';
import { migrateAssetRegistryContracts, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';
import * as Asset from '..';

describe('AssetConsumingLogic Facade', () => {
    const configFile = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8'));

    const Web3 = require('web3');
    const web3: Web3Type = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x') ?
        configFile.develop.deployKey : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: GeneralLib.Configuration.Entity;

    let userContractLookup: UserContractLookup;
    let userContractLookupAddr: string;
    let assetConsumingLogic: AssetConsumingRegistryLogic;
    let userLogic: UserLogic;

    /*
    let assetContractLookup: AssetContractLookup;
    let assetProducingLogic: AssetProducingRegistryLogic;
    let assetProducingDB: AssetProducingDB;
    let assetConsumingDB: AssetConsumingDB;
    */

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const matcher = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    it('should deploy user-registry contracts', async () => {
        const userContracts = await migrateUserRegistryContracts((web3 as any));
        userContractLookupAddr =
            userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserContractLookup.json'];
        userLogic =
            new UserLogic((web3 as any), userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserLogic.json']);

        await userLogic.setUser(accountDeployment, 'admin', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountDeployment, 3, { privateKey: privateKeyDeployment });

        userContractLookup = new UserContractLookup((web3 as any),
                                                    userContractLookupAddr);

    });

    it('should deploy asset-registry contracts', async () => {
        const deployedContracts = await migrateAssetRegistryContracts((web3 as any), userContractLookupAddr);
        assetConsumingLogic = new AssetConsumingRegistryLogic((web3 as any), deployedContracts[process.cwd() + '/node_modules/ew-asset-registry-contracts/dist/contracts/AssetConsumingRegistryLogic.json']);
    });

    it('should onboard tests-users', async () => {

        await userLogic.setUser(assetOwnerAddress, 'assetOwner', { privateKey: privateKeyDeployment });
        await userLogic.setRoles(assetOwnerAddress, 8, { privateKey: privateKeyDeployment });
    });

    it('should onboard a new asset', async () => {
        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment, privateKey: privateKeyDeployment,
                },
                consumingAssetLogicInstance: assetConsumingLogic,
                userLogicInstance: userLogic,
                web3,
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030',
            },
            logger,
        };

        const assetProps: Asset.ConsumingAsset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: matcher }],
            propertiesDocumentHash: null,
            url: null,
        };

        const assetPropsOffChain: Asset.Asset.OffChainProperties = {
            operationalSince: 10,
            capacityWh: 10,
            country: 'bla',
            region: 'bla',
            zip: 'bla',
            city: 'bla',
            street: 'bla',
            houseNumber: 'bla',
            gpsLatitude: 'bla',
            gpsLongitude: 'bla',
        };

        assert.equal(await Asset.ConsumingAsset.getAssetListLength(conf), 0);

        const asset = await Asset.ConsumingAsset.createAsset(assetProps, assetPropsOffChain, conf);
        delete asset.configuration;
        delete asset.proofs;
        delete asset.propertiesDocumentHash;

        assert.deepEqual({
            id: '0',
            initialized: true,
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: '0',
            active: true,
            lastSmartMeterReadFileHash: '',
            matcher: [{ address: [matcher] }],
            offChainProperties: assetPropsOffChain,
            url: 'http://localhost:3030/ConsumingAsset',
        } as any,        asset);
        assert.equal(await Asset.ConsumingAsset.getAssetListLength(conf), 1);

    });

    it('should fail when onboarding the same asset again', async () => {

        const assetProps: Asset.Asset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: matcher }],
            propertiesDocumentHash: null,
            url: null,
        };

        const assetPropsOffChain: Asset.Asset.OffChainProperties = {
            operationalSince: 10,
            capacityWh: 10,
            country: 'USA',
            region: 'AnyState',
            zip: '012345',
            city: 'Anytown',
            street: 'Main-Street',
            houseNumber: '42',
            gpsLatitude: '0.0123123',
            gpsLongitude: '31.1231',
        };

        assert.equal(await Asset.ConsumingAsset.getAssetListLength(conf), 1);

        try {
            const asset = await Asset.ConsumingAsset.createAsset(assetProps, assetPropsOffChain, conf);
        } catch (e) {
            assert.include(e.message, 'smartmeter does already exist');
        }
        assert.equal(await Asset.ConsumingAsset.getAssetListLength(conf), 1);

    });
});
