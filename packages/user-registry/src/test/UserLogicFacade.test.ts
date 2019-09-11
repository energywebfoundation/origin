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
import {
    UserLogic,
    UserContractLookup
} from '..';
import { migrateUserRegistryContracts } from '../utils/migrateContracts';
import { User } from '..';
import { Configuration } from '@energyweb/utils-general';
import { logger } from '../blockchain-facade/Logger';
import Web3 from 'web3';
import { buildRights, Role } from '../wrappedContracts/RoleManagement';

describe('UserLogic Facade', () => {
    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3 = new Web3(configFile.develop.web3);

    let userContractLookup: UserContractLookup;
    let userRegistry: UserLogic;

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    const user1PK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const user1 = web3.eth.accounts.privateKeyToAccount(user1PK).address;

    const user2PK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const user2 = web3.eth.accounts.privateKeyToAccount(user2PK).address;

    const RIGHTS = buildRights([Role.Trader, Role.AssetManager]);

    it('should deploy the contracts', async () => {
        const contracts = (await migrateUserRegistryContracts(
            web3 as any,
            privateKeyDeployment
        )) as any;

        userContractLookup = new UserContractLookup(web3 as any, contracts.UserContractLookup);
        userRegistry = new UserLogic(web3 as any, await userContractLookup.userRegistry());

        // const bytecodeUserContractLookup = await web3.eth.getCode(contracts.UserContractLookup);
        // assert.isTrue(bytecodeUserContractLookup.length > 0);
        // assert.equal(bytecodeUserContractLookup, '0x' + UserContractLookupJSON.bytecode);
    });

    it('should create a user', async () => {
        const userPropsOnChain: User.IUserOnChainProperties = {
            url: null,
            propertiesDocumentHash: null,
            id: user1,
            active: true,
            roles: RIGHTS,
            organization: 'Testorganization'
        };

        const userPropsOffChain: User.IUserOffChainProperties = {
            firstName: 'John',
            surname: 'Doe',
            email: 'john@doe.com',
            street: 'Evergreen Terrace',
            number: '101',
            zip: '14789',
            city: 'Shelbyville',
            country: 'US',
            state: 'FL',
            notifications: false
        };

        conf = {
            blockchainProperties: {
                web3,
                userLogicInstance: userRegistry,
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                }
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030'
            },
            logger
        };

        await User.createUser(userPropsOnChain, userPropsOffChain, conf);

        const user = await new User.Entity(user1, conf).sync();

        delete user.configuration;
        delete user.proofs;
        delete user.propertiesDocumentHash;
        delete user.url;

        assert.deepEqual(
            {
                id: user1.toLowerCase(),
                organization: 'Testorganization',
                roles: RIGHTS,
                active: true,
                initialized: true,
                offChainProperties: userPropsOffChain
            } as any,
            user
        );
    });

    it('isRole should work correctly', async () => {
        const user = await new User.Entity(user1, conf).sync();

        assert.ok(user.isRole(Role.AssetManager));
        assert.ok(user.isRole(Role.Trader));
        assert.notOk(user.isRole(Role.Issuer));
        assert.notOk(user.isRole(Role.AssetAdmin));
        assert.notOk(user.isRole(Role.Matcher));
        assert.notOk(user.isRole(Role.UserAdmin));
    });

    it('Should get offChainProperties correctly', async () => {
        const user = await new User.Entity(user1, conf).sync();

        assert.deepEqual(user.offChainProperties, {
            city: 'Shelbyville',
            country: 'US',
            email: 'john@doe.com',
            firstName: 'John',
            number: '101',
            notifications: false,
            state: 'FL',
            street: 'Evergreen Terrace',
            surname: 'Doe',
            zip: '14789'
        });
    });

    it('Should update offChainProperties correctly', async () => {
        let user = await new User.Entity(user1, conf).sync();

        assert.ownInclude(user.offChainProperties, {
            city: 'Shelbyville'
        });

        conf.blockchainProperties.activeUser = {
            address: user1,
            privateKey: user1PK
        };

        const newProperties: User.IUserOffChainProperties = user.offChainProperties;
        newProperties.city = 'New York';

        await user.update(newProperties);

        user = await user.sync();

        assert.ownInclude(user.offChainProperties, {
            city: 'New York'
        });
    });
});
