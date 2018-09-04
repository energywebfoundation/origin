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
const AssetProducingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());

describe('AssetProducingLogic', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let producingLogic

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
        producingLogic = await getInstanceFromBuild(AssetProducingLogicTruffleBuild, web3)
    })

    it('should have 0 assets in assetList', async () => {
        assert.equal(await producingLogic.methods.getAssetListLength().call(), 0)
    })

    it('should create a new asset', async () => {

        let tx = await producingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 1, TestAccounts.matcher, true, "propertiesString", "urlString")
            .send({ from: TestAccounts.assetAdmin, gas: 7000000, gasPrice: 0 })

        let event = tx.events.LogAssetCreated
        assert.equal(event.event, "LogAssetCreated")
        assert.equal(event.returnValues._assetId, 0)
        assert.equal(event.returnValues._sender, TestAccounts.assetAdmin)

    }).timeout(10000)

    it('should have 1 assets in assetList', async () => {

        assert.equal(await producingLogic.methods.getAssetListLength().call(), 1)
    })

    it('should have created asset correctly', async () => {
        assert.deepEqual({
            '0': '0',
            '1': TestAccounts.smartMeter,
            '2': TestAccounts.assetManager,
            '3': '0',
            '4': true,
            '5': '',
            '6': [TestAccounts.matcher],
            '7': '0',
            '8': '0',
            '9': '1',
            '10': 'propertiesString',
            '11': 'urlString',
            _certificatesUsedForWh: '0',
            _smartMeter: TestAccounts.smartMeter,
            _owner: TestAccounts.assetManager,
            _lastSmartMeterReadWh: '0',
            _active: true,
            _lastSmartMeterReadFileHash: '',
            _matcher: [TestAccounts.matcher],
            _certificatesCreatedForWh: '0',
            _lastSmartMeterCO2OffsetRead: '0',
            _maxOwnerChanges: '1',
            _propertiesDocumentHash: 'propertiesString',
            _url: 'urlString'
        }, await producingLogic.methods.getAsset(0).call())
    })

    it('should not log data with the wrong smart meter', async () => {
        const assetBefore = await producingLogic.methods.getAsset(0).call()

        try {
            await producingLogic.methods.saveSmartMeterRead(0, 100, false, "newMeterRead",
                10, false)
                .send({ from: TestAccounts.assetAdmin, gas: 7000000 })
        } catch (e) {

        }
        const assetAfter = await producingLogic.methods.getAsset(0).call()
        assert.deepEqual(assetBefore, assetAfter)

    })


    it('should trigger an event when calling saveSmartMeterRead', async () => {

        const tx = await producingLogic.methods.saveSmartMeterRead(0, 100, false, "newMeterRead",
            10, false)
            .send({ from: TestAccounts.smartMeter, gas: 7000000 })

        const event = tx.events.LogNewMeterRead
        assert.equal(event.event, "LogNewMeterRead")
        assert.deepEqual({
            '0': '0',
            '1': '0',
            '2': '100',
            '3': null,
            '4': '0',
            '5': '0',
            '6': '10',
            '7': null,
            _assetId: '0',
            _oldMeterRead: '0',
            _newMeterRead: '100',
            _smartMeterDown: null,
            _certificatesCreatedForWh: '0',
            _oldCO2OffsetReading: '0',
            _newCO2OffsetReading: '10',
            _serviceDown: null
        }, event.returnValues)
    })

    it('should have updated asset correctly', async () => {

        assert.deepEqual({
            '0': '0',
            '1': TestAccounts.smartMeter,
            '2': TestAccounts.assetManager,
            '3': '100',
            '4': true,
            '5': 'newMeterRead',
            '6': [TestAccounts.matcher],
            '7': '100',
            '8': '10',
            '9': '1',
            '10': 'propertiesString',
            '11': 'urlString',
            _certificatesUsedForWh: '0',
            _smartMeter: TestAccounts.smartMeter,
            _owner: TestAccounts.assetManager,
            _lastSmartMeterReadWh: '100',
            _active: true,
            _lastSmartMeterReadFileHash: 'newMeterRead',
            _matcher: [TestAccounts.matcher],
            _certificatesCreatedForWh: '100',
            _lastSmartMeterCO2OffsetRead: '10',
            _maxOwnerChanges: '1',
            _propertiesDocumentHash: 'propertiesString',
            _url: 'urlString'
        }, await producingLogic.methods.getAsset(0).call())
    })


});