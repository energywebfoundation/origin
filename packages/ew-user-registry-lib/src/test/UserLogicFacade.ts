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
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import { UserLogic, UserContractLookup, migrateUserRegistryContracts, UserContractLookupJSON, UserLogicJSON} from 'ew-user-registry-contracts';
import { UserProperties, UserPropertiesOffChain, User } from '../blockchain-facade/Users/User';
import { Configuration } from 'ew-utils-general-lib';
import { logger } from '../blockchain-facade/Logger';
import Web3 from 'web3';

describe('UserLogic Facade', () => {
    const configFile = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8'));

    const web3 = new Web3(configFile.develop.web3);

    let userContractLookup: UserContractLookup;
    let userRegistry: UserLogic;

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x') ?
        configFile.develop.deployKey : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    const user1PK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const user1 = web3.eth.accounts.privateKeyToAccount(user1PK).address;

    const user2PK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const user2 = web3.eth.accounts.privateKeyToAccount(user2PK).address;

    it('should deploy the contracts', async () => {

        const contracts = await migrateUserRegistryContracts((web3 as any), privateKeyDeployment) as any;

        userContractLookup = new UserContractLookup((web3 as any), contracts.UserContractLookup);
        userRegistry = new UserLogic((web3 as any), await userContractLookup.userRegistry());



        // const bytecodeUserContractLookup = await web3.eth.getCode(contracts.UserContractLookup);
        // assert.isTrue(bytecodeUserContractLookup.length > 0);
        // assert.equal(bytecodeUserContractLookup, '0x' + UserContractLookupJSON.bytecode);




    });

    it('should create a user', async () => {

        const userProps: UserProperties = {
            id: user1,
            active: true,
            roles: 27,
            organization: 'Testorganization',
        };

        const userPropsOffchain: UserPropertiesOffChain = {

            firstName: 'John',
            surname: 'Doe',
            street: 'Evergreen Terrace',
            number: '101',
            zip: '14789',
            city: 'Shelbyville',
            country: 'US',
            state: 'FL',

        };

        conf = {
            blockchainProperties: {
                web3,
                userLogicInstance: userRegistry,
                activeUser: {
                    address: accountDeployment, privateKey: privateKeyDeployment,
                },
            },
            logger,

        };

        const user = await User.CREATE_USER(userProps, userPropsOffchain, conf);

        delete user.configuration;
        delete user.proofs;

        assert.deepEqual({
            id: user1,
            organization: 'Testorganization',
            roles: 27,
            active: true,
        } as any,        user);
    });

    it('should return correct user', async () => {

        const user = await (new User(user1, conf)).sync();

        delete user.configuration;

        assert.deepEqual(user, {
            id: user1,
            proofs: [],
            organization: 'Testorganization',
            roles: 27,
            active: true,
        });

        const emptyAccount = await (new User(user2, conf)).sync();
        delete emptyAccount.configuration;

        assert.deepEqual(emptyAccount, {
            id: user2,
            proofs: [],
            organization: '',
            roles: 0,
            active: false,
        });

        const adminAccount = await (new User(accountDeployment, conf)).sync();
        delete adminAccount.configuration;

        assert.deepEqual(adminAccount, {
            id: accountDeployment,
            proofs: [],
            organization: '',
            roles: 1,
            active: false,
        });

    });

});
