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
/*
import { expect, assert } from 'chai';
import 'mocha';
import Web3Type from '../../types/web3';
import * as fs from 'fs';
import { getInstanceFromBuild } from './utils'
import { TestAccounts } from './TestAccounts'
const UserLogic = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());

export async function prepare(web3: Web3Type) {

    console.log("Preparing")

    const userLogic = await getInstanceFromBuild(UserLogic, web3)

    //("creating UserAdmin")
    await userLogic.methods.setUser(TestAccounts.userAdmin, 'userAdmin')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.userAdmin, 2)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("creating AssetAdmin")
    await userLogic.methods.setUser(TestAccounts.assetAdmin, 'assetAdmin')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.assetAdmin, 4)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("create AgreementAdmin")
    await userLogic.methods.setUser(TestAccounts.agreementAdmin, 'agreementAdmin')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.agreementAdmin, 8)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("create AssetManager")
    await userLogic.methods.setUser(TestAccounts.assetManager, 'assetManager')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.assetManager, 16)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("create Trader")
    await userLogic.methods.setUser(TestAccounts.trader, 'trader')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.trader, 32)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("create user1")
    await userLogic.methods.setUser(TestAccounts.user1, 'user1')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.user1, 48)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

    //("create user1")
    await userLogic.methods.setUser(TestAccounts.user2, 'user2')
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
    await userLogic.methods.setRoles(TestAccounts.user2, 48)
        .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
}

*/
