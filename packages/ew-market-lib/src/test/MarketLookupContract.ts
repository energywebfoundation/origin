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
import { migrateUserRegistryContracts, UserLogic, buildRights, Role } from 'ew-user-registry-lib';
import { migrateAssetRegistryContracts, AssetContractLookup } from 'ew-asset-registry-lib';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { MarketContractLookup } from '../wrappedContracts/MarketContractLookup';
import { MarketDB } from '../wrappedContracts/MarketDB';
import { MarketLogic } from '../wrappedContracts/MarketLogic';
import { MarketContractLookupJSON, MarketLogicJSON, MarketDBJSON } from '..';

describe('MarketContractLookup', () => {
    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let assetRegistryContract: AssetContractLookup;
    let marketRegistryContract: MarketContractLookup;
    let marketDB: MarketDB;
    let marketLogic: MarketLogic;
    let isGanache: boolean;

    it('should deploy the contracts', async () => {
        isGanache = true;
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        const userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.setUser(accountDeployment, 'admin', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountDeployment, buildRights([
            Role.UserAdmin,
            Role.AssetAdmin
        ]), { privateKey: privateKeyDeployment });

        const userContractLookupAddr = (userContracts as any).UserContractLookup;

        const assetContracts = await migrateAssetRegistryContracts(
            web3,
            userContractLookupAddr,
            privateKeyDeployment
        );

        const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

        const marketContracts = await migrateMarketRegistryContracts(
            web3,
            assetRegistryLookupAddr,
            privateKeyDeployment
        );

        assetRegistryContract = new AssetContractLookup(web3 as any, assetRegistryLookupAddr);

        for (let key of Object.keys(marketContracts)) {
            let tempBytecode;
            if (key.includes('MarketContractLookup')) {
                marketRegistryContract = new MarketContractLookup(web3, marketContracts[key]);
                tempBytecode = MarketContractLookupJSON.deployedBytecode;
            }

            if (key.includes('MarketLogic')) {
                marketLogic = new MarketLogic(web3, marketContracts[key]);
                tempBytecode = MarketLogicJSON.deployedBytecode;
            }

            if (key.includes('MarketDB')) {
                marketDB = new MarketDB(web3, marketContracts[key]);
                tempBytecode = MarketDBJSON.deployedBytecode;
            }
            const deployedBytecode = await web3.eth.getCode(marketContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            assert.equal(deployedBytecode, tempBytecode);
        }
    });

    it('should have the right owner', async () => {
        assert.equal(await marketRegistryContract.owner(), accountDeployment);
    });

    it('should have the right registries', async () => {
        assert.equal(
            await marketRegistryContract.marketLogicRegistry(),
            marketLogic.web3Contract._address
        );
        assert.equal(
            await marketRegistryContract.assetContractLookup(),
            assetRegistryContract.web3Contract._address
        );
    });

    it('should fail when trying to call init again', async () => {
        let failed = false;

        try {
            await marketRegistryContract.init(
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'already initialized');
        }
        assert.isTrue(failed);
    });

    it('should throw an error when calling update as non Owner', async () => {
        let failed = false;
        try {
            await marketRegistryContract.update('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }
        assert.isTrue(failed);
    });

    it('should be able to update as owner', async () => {
        await marketRegistryContract.update('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await marketRegistryContract.marketLogicRegistry(),
            '0x1000000000000000000000000000000000000005'
        );
        assert.equal(await marketDB.owner(), '0x1000000000000000000000000000000000000005');
    });

    it('should throw when trying to change owner as non-owner', async () => {
        let failed = false;

        try {
            await marketRegistryContract.changeOwner('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should be able to change owner ', async () => {
        await marketRegistryContract.changeOwner('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await marketRegistryContract.owner(),
            '0x1000000000000000000000000000000000000005'
        );
    });
});
