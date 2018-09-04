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
import * as TestAccounts from '../utils/testing/TestAccounts'

import { makeSnapshot, revertSnapshot, getInstanceFromBuild } from '../utils/testing/utils'
import { prepare } from '../utils/testing/preparation'

const Web3 = require('web3')
const AssetConsumingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());

describe('AssetConsumingLogic', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let consumingLogic

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
        consumingLogic = await getInstanceFromBuild(AssetConsumingLogicTruffleBuild, web3)
    })

    it('should have 0 assets in assetList', async () => {
        assert.equal(await consumingLogic.methods.getAssetListLength().call(), 0)
    })


    it('should get an event when creating a new asset', async () => {

        const tx = await consumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesString", "urlString")
            .send({ from: TestAccounts.assetAdmin, gas: 7000000, gasPrice: 0 })

        let event = tx.events.LogAssetCreated
        assert.equal(event.event, "LogAssetCreated")
        assert.equal(event.returnValues._assetId, 0)
        assert.equal(event.returnValues._sender, TestAccounts.assetAdmin)

    }).timeout(10000)

    it('should have 1 assets in assetList', async () => {
        assert.equal(await consumingLogic.methods.getAssetListLength().call(), 1)
    })

    it('should have created asset correctly', async () => {

        assert.deepEqual({
            "0": TestAccounts.smartMeter,
            "1": TestAccounts.assetManager,
            "2": '0',
            "3": '0',
            "4": true,
            "5": '',
            "6": 'propertiesString',
            "7": 'urlString',
            "8": [TestAccounts.matcher],
            _smartMeter: TestAccounts.smartMeter,
            _owner: TestAccounts.assetManager,
            _lastSmartMeterReadWh: '0',
            _certificatesUsedForWh: '0',
            _active: true,
            _lastSmartMeterReadFileHash: '',
            _propertiesDocumentHash: 'propertiesString',
            _url: 'urlString',
            _matcher: [TestAccounts.matcher]
        }, await consumingLogic.methods.getAsset(0).call())
    })

    it('should not log data with the wrong smart meter', async () => {
        const assetBefore = await consumingLogic.methods.getAsset(0).call()

        try {
            await consumingLogic.methods.saveSmartMeterRead(0, 100, "newMeterRead", false)
                .send({ from: TestAccounts.assetManager, gas: 7000000 })
        } catch (e) {

        }
        const assetAfter = await consumingLogic.methods.getAsset(0).call()

        assert.deepEqual(assetBefore, assetAfter)

    })

    it('should trigger an event when calling saveSmartMeterRead', async () => {
        let tx = await consumingLogic.methods.saveSmartMeterRead(0, 100, "newMeterRead", false)
            .send({ from: TestAccounts.smartMeter, gas: 7000000 })

        const event = tx.events.LogNewMeterRead
        assert.equal(event.event, "LogNewMeterRead")
        assert.deepEqual({
            '0': '0',
            '1': '0',
            '2': '100',
            '3': '0',
            '4': null,
            _assetId: '0',
            _oldMeterRead: '0',
            _newMeterRead: '100',
            _certificatesUsedForWh: '0',
            _smartMeterDown: null
        }, event.returnValues)
    }).timeout(5000)

    it('should have updated asset correctly', async () => {
        assert.deepEqual({
            '0': TestAccounts.smartMeter,
            '1': TestAccounts.assetManager,
            '2': '100',
            '3': '0',
            '4': true,
            '5': 'newMeterRead',
            "6": 'propertiesString',
            "7": 'urlString',
            "8": [TestAccounts.matcher],
            _smartMeter: TestAccounts.smartMeter,
            _owner: TestAccounts.assetManager,
            _lastSmartMeterReadWh: '100',
            _certificatesUsedForWh: '0',
            _active: true,
            _lastSmartMeterReadFileHash: 'newMeterRead',
            _propertiesDocumentHash: 'propertiesString',
            _url: 'urlString',
            _matcher: [TestAccounts.matcher]
        }, await consumingLogic.methods.getAsset(0).call())


    })

});

