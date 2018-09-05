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
import Web3Type from '../types/web3';
import * as fs from 'fs';

import { makeSnapshot, revertSnapshot, getInstanceFromBuild } from '../utils/testing/utils'
import { prepare } from '../utils/testing/preparation'

const Web3 = require('web3')
const UserLogicBuild = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());

describe('UserLogic', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let userLogic

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

    it('should get the instance', async () => {
        userLogic = await getInstanceFromBuild(UserLogicBuild, web3)
    })

    it('should return 0 values for non existing user', async () => {

        assert.deepEqual({
            '0': '',
            '1': '0',
            '2': false,
            _organization: '',
            _roles: '0',
            _active: false
        }, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should be able to set a user', async () => {

        await userLogic.methods.setUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", 'testorganization')
            .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })
        const fullUser = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()
        assert.deepEqual({
            '0': 'testorganization',
            '1': '0',
            '2': true,
            _organization: 'testorganization',
            _roles: '0',
            _active: true
        }, fullUser)

    })

    it('should prevent setting empty organization', async () => {
        const fullUserBefore = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()

        try {
            await userLogic.methods.setUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", '')
                .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })
        } catch (e) { }
        assert.deepEqual(fullUserBefore, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should be able to edit a user', async () => {

        await userLogic.methods.setUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", 'testorganization2')
            .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })
        const fullUser = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()
        assert.deepEqual({
            '0': 'testorganization2',
            '1': '0',
            '2': true,
            _organization: 'testorganization2',
            _roles: '0',
            _active: true
        }, fullUser)

    })

    it('should be able to set Roles for an existing user', async () => {

        await userLogic.methods.setRoles("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", 1)
            .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })

        assert.deepEqual({
            '0': 'testorganization2',
            '1': '1',
            '2': true,
            _organization: 'testorganization2',
            _roles: '1',
            _active: true
        }, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should not be possible to deactive an admin user', async () => {

        const userBefore = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()
        try {
            await userLogic.methods.deactivateUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8")
                .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })
        } catch (e) {

        }
        assert.deepEqual(userBefore, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should be able to set Roles for an existing user', async () => {

        await userLogic.methods.setRoles("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", 16)
            .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })

        assert.deepEqual({
            '0': 'testorganization2',
            '1': '16',
            '2': true,
            _organization: 'testorganization2',
            _roles: '16',
            _active: true
        }, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should be possible to deactive a regular user', async () => {

        const userBefore = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()

        await userLogic.methods.deactivateUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8")
            .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })

        assert.deepEqual({
            '0': 'testorganization2',
            '1': '16',
            '2': false,
            _organization: 'testorganization2',
            _roles: '16',
            _active: false
        }, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })

    it('should not be possible to change roles on a deactivated user', async () => {

        const userBefore = await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call()
        try {
            await userLogic.methods.setRoles("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8", 1)
                .send({ from: '0xd173313a51f8fc37bcf67569b463abd89d81844f', gas: 7000000, gasPrice: 0 })
        } catch (e) {

        }
        assert.deepEqual(userBefore, await userLogic.methods.getFullUser("0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8").call())
    })
});
 */
