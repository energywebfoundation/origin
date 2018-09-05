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

import { expect, assert } from 'chai';
import 'mocha';
import Web3Type from '../types/web3';
import * as fs from 'fs';
import { TestAccounts } from '../utils/testing/TestAccounts'

import { makeSnapshot, revertSnapshot, getInstanceFromBuild } from '../utils/testing/utils'
import { prepare } from '../utils/testing/preparation'
import { Configuration } from '../blockchain-facade/Configuration';
import { UserProperties, User, UserPropertiesOffChain } from '../blockchain-facade/Users/User';
import { UserLogic } from '../contractWrapper/UserLogic';
import { logger } from './Logger';

const Web3 = require('web3')

describe('UserLogic Facade', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let conf: Configuration

    const init = async () => {
        web3 = new Web3('http://localhost:8545')
    }

    before(async () => {
        await init();
        snapShotId = await makeSnapshot(web3)
        await prepare(web3)
    });

    after(async () => {
        await revertSnapshot(snapShotId, web3)
    });

    it('should create a user', async () => {

        const userProps: UserProperties = {
            id: TestAccounts.user1,
            active: true,
            roles: 27,
            organization: "Testorganization"
        }

        const userPropsOffchain: UserPropertiesOffChain =  {
 
            firstName: 'John',
            surname: 'Doe',
            street: 'Evergreen Terrace',
            number: '101',
            zip: '14789',
            city: 'Shelbyville',
            country: 'US',
            state: 'FL'
        
        }
        

        conf = {
            blockchainProperties: {
                web3: web3,
                userLogicInstance: new UserLogic(web3),
                activeUser: {
                    address: TestAccounts.userAdmin, privateKey: "0x" + TestAccounts.userAdminPK
                }
            },
            logger: logger

        }

        const user = await User.CREATE_USER(userProps, userPropsOffchain, conf)

        delete user.configuration
        delete user.proofs

        assert.deepEqual({
            id: '0x87CEC041a6CdcD349124Fd6B93C0ab3012647cc3',
            organization: 'Testorganization',
            roles: 27,
            active: true
        } as any, user)
    })



});

