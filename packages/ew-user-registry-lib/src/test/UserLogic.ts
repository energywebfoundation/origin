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
import { migrateUserRegistryContracts } from '../utils/migrateContracts';
import { UserContractLookup } from '../wrappedContracts/UserContractLookup';
import { UserLogic } from '../wrappedContracts/UserLogic';
import { UserDB } from '../wrappedContracts/UserDB';
import { UserContractLookupJSON, UserLogicJSON, UserDBJSON } from '..';
import { Role, buildRights } from '../wrappedContracts/RoleManagement';

describe('UserLogic', () => {
    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3: Web3 = new Web3(configFile.develop.web3);

    let userContractLookup: UserContractLookup;
    let userLogic: UserLogic;
    let userDB: UserDB;

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    it('should deploy the contracts', async () => {
        const contracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        let numberContracts = 0;

        for (const key of Object.keys(contracts)) {
            numberContracts += 1;

            let tempBytecode;

            if (key.includes('UserContractLookup')) {
                userContractLookup = new UserContractLookup(web3 as any, contracts[key]);
                tempBytecode = (UserContractLookupJSON as any).deployedBytecode;
            } else if (key.includes('UserLogic')) {
                userLogic = new UserLogic(web3 as any, contracts[key]);
                tempBytecode = (UserLogicJSON as any).deployedBytecode;
            } else if (key.includes('UserDB')) {
                userDB = new UserDB(web3 as any, contracts[key]);
                tempBytecode = (UserDBJSON as any).deployedBytecode;
            }

            const deployedBytecode = await web3.eth.getCode(contracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            assert.equal(deployedBytecode, tempBytecode);
        }

        assert.equal(numberContracts, 3);
    });

    it('should have the right owner', async () => {
        assert.equal(await userLogic.owner(), userContractLookup.web3Contract._address);
    });

    it('should have the right db', async () => {
        assert.equal(await userLogic.db(), userDB.web3Contract._address);
    });

    it('should throw an error when calling init again', async () => {
        let failed = false;

        try {
            await userLogic.init(userLogic.web3Contract._address, userLogic.web3Contract._address, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            assert.include(ex.message, 'msg.sender is not owner');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should gave the UserAdmin rights to the deployer account', async () => {
        assert.equal(await userLogic.getRolesRights(accountDeployment), 1);

        assert.equal(await userLogic.isRole(Role.UserAdmin, accountDeployment), true);
        assert.equal(await userLogic.isRole(Role.AssetAdmin, accountDeployment), false);
        assert.equal(await userLogic.isRole(Role.AssetManager, accountDeployment), false);
        assert.equal(await userLogic.isRole(Role.Matcher, accountDeployment), false);
        assert.equal(await userLogic.isRole(Role.Trader, accountDeployment), false);
    });

    it('should return 0 rights for random accounts', async () => {
        assert.equal(
            await userLogic.getRolesRights('0x1000000000000000000000000000000000000005'),
            0
        );
    });

    it('should return false when asking for a non-exising user', async () => {
        assert.isFalse(await userLogic.doesUserExist('0x1000000000000000000000000000000000000005'));
    });

    it('should return empty values for a non existing user', async () => {
        assert.deepEqual(
            await userLogic.getFullUser('0x1000000000000000000000000000000000000005'),
            {
                0: '',
                1: '0',
                2: false,
                _organization: '',
                _roles: '0',
                _active: false
            }
        );
    });

    it('should fail when trying to set roles for a non-existing user', async () => {
        let failed = false;
        try {
            await userLogic.setRoles('0x1000000000000000000000000000000000000005', 1, {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            assert.include(ex.message, 'User does not exist');
            failed = true;
        }
        assert.isTrue(failed);
    });

    it('should return correct values for an existing user', async () => {
        await userLogic.setUser('0x1000000000000000000000000000000000000005', 'TestOrganization', {
            privateKey: privateKeyDeployment
        });

        assert.deepEqual(
            await userLogic.getFullUser('0x1000000000000000000000000000000000000005'),
            {
                0: 'TestOrganization',
                1: '0',
                2: true,
                _organization: 'TestOrganization',
                _roles: '0',
                _active: true
            }
        );
    });

    it('should fail trying to set roles as non user-Admin', async () => {
        let failed = false;
        try {
            await userLogic.setRoles('0x1000000000000000000000000000000000000005', 1, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }
        assert.isTrue(failed);
    });

    it('should set roles as non user-Admin', async () => {
        await userLogic.setRoles('0x1000000000000000000000000000000000000005', 1, {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await userLogic.getRolesRights('0x1000000000000000000000000000000000000005'),
            1
        );
        assert.deepEqual(
            await userLogic.getFullUser('0x1000000000000000000000000000000000000005'),
            {
                0: 'TestOrganization',
                1: '1',
                2: true,
                _organization: 'TestOrganization',
                _roles: '1',
                _active: true
            }
        );
    });

    it('should return true when asking for an exising user', async () => {
        assert.isTrue(await userLogic.doesUserExist('0x1000000000000000000000000000000000000005'));
    });

    it('should fail when trying to deactive an active admin-account', async () => {
        let failed = false;
        try {
            await userLogic.deactivateUser('0x1000000000000000000000000000000000000005', {
                privateKey: privateKeyDeployment
            });
        } catch (ex) {
            failed = true;
        }
        assert.isTrue(failed);
    });

    it('should deactive user when he is not an admin anymore', async () => {
        await userLogic.setRoles('0x1000000000000000000000000000000000000005', 48, {
            privateKey: privateKeyDeployment
        });
        await userLogic.deactivateUser('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });
        assert.isFalse(await userLogic.doesUserExist('0x1000000000000000000000000000000000000005'));
    });

    it('should correctly grant AssetManager and Trader roles when mixed together as rights', async () => {
        const TEST_ACCOUNT = '0x1000000000000000000000000000000000000006';

        const rights = buildRights([Role.AssetManager, Role.Trader]);

        await userLogic.setUser(TEST_ACCOUNT, 'TestOrganization', {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(TEST_ACCOUNT, rights, {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await userLogic.getRolesRights(TEST_ACCOUNT),
            rights
        );

        assert.equal(await userLogic.isRole(Role.UserAdmin, TEST_ACCOUNT), false);
        assert.equal(await userLogic.isRole(Role.AssetAdmin, TEST_ACCOUNT), false);
        assert.equal(await userLogic.isRole(Role.AssetManager, TEST_ACCOUNT), true);
        assert.equal(await userLogic.isRole(Role.Matcher, TEST_ACCOUNT), false);
        assert.equal(await userLogic.isRole(Role.Trader, TEST_ACCOUNT), true);
    });
});
