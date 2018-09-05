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

import { TestAccounts } from '../utils/testing/TestAccounts'
import { makeSnapshot, revertSnapshot, getInstanceFromBuild } from '../utils/testing/utils'
import { prepare } from '../utils/testing/preparation'

const Web3 = require('web3')
const CooBuild = JSON.parse(fs.readFileSync('build/contracts/CoO.json', 'utf-8').toString());
const AssetProducingLogic = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
const AssetConsumingLogic = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
const UserLogic = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());
const MarketLogic = JSON.parse(fs.readFileSync('build/contracts/MarketLogic.json', 'utf-8').toString());
const CertificateLogic = JSON.parse(fs.readFileSync('build/contracts/CertificateLogic.json', 'utf-8').toString());

describe('RoleManagement', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let assetConsumingLogic, assetProducingLogic, certificateLogic, marketLogic, userLogic

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

    describe('AssetConsumingLogic', () => {

        it('should get the instance', async () => {
            assetConsumingLogic = await getInstanceFromBuild(AssetConsumingLogic, web3)
        })

        it('should not be possible to create an Asset as UserAdmin', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                    .send({ from: TestAccounts.userAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as AgreementAdmin', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                    .send({ from: TestAccounts.agreementAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as AssetManager', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                    .send({ from: TestAccounts.assetManager, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as Trader', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                    .send({ from: TestAccounts.trader, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset with random account', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                    .send({ from: "0xb4b70c22665618dc22462d1e57b1a32e4d73bb32", gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should be possible to create an Asset as assetAdmin', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                .send({ from: TestAccounts.assetAdmin, gas: 7000000, gasPrice: 0 })

            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 1)
        })

        it('should be possible to create an Asset as topAdmin', async () => {
            const assetAmountBefore = await assetConsumingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 1)

            await assetConsumingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, true, TestAccounts.matcher, "propertiesHash", "url")
                .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })

            assert.equal(await assetConsumingLogic.methods.getAssetListLength().call(), 2)
        })
    })

    describe('AssetProducingLogic', () => {

        it('should get the instance', async () => {
            assetProducingLogic = await getInstanceFromBuild(AssetProducingLogic, web3)
        })

        it('should not be possible to create an Asset as userAdmin', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                    .send({ from: TestAccounts.userAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as AgreementAdmin', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                    .send({ from: TestAccounts.agreementAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as AssetManager', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                    .send({ from: TestAccounts.assetManager, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset as Trader', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                    .send({ from: TestAccounts.trader, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should not be possible to create an Asset with random account', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            try {
                await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                    .send({ from: "0xb4b70c22665618dc22462d1e57b1a32e4d73bb32", gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 0)
        })

        it('should be possible to create an Asset with as assetAdmin', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 0)

            await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                .send({ from: TestAccounts.assetAdmin, gas: 7000000, gasPrice: 0 })
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 1)
        })

        it('should be possible to create an Asset with as topAdmin', async () => {
            const assetAmountBefore = await assetProducingLogic.methods.getAssetListLength().call()

            assert.equal(assetAmountBefore, 1)

            await assetProducingLogic.methods.createAsset(TestAccounts.smartMeter, TestAccounts.assetManager, 3, TestAccounts.matcher, true, "propertiesHash", "url")
                .send({ from: TestAccounts.topAdmin, gas: 7000000, gasPrice: 0 })
            assert.equal(await assetProducingLogic.methods.getAssetListLength().call(), 2)
        })

    })

    describe('DemandLogic', () => {

        it('should get the instance', async () => {
            marketLogic = await getInstanceFromBuild(MarketLogic, web3)
        })

        it('should not be possible to create a demand as userAdmin', async () => {

            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

            try {
                const tx = await marketLogic.methods.createDemand("propertiesDocumentHash", "documentDBURL")
                    .send({ from: TestAccounts.userAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

        })

        it('should not be possible to create a demand as assetAdmin', async () => {

            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

            try {
                const tx = await marketLogic.methods.createDemand("propertiesDocumentHash", "documentDBURL")
                    .send({ from: TestAccounts.assetAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

        })

        it('should not be possible to create a demand as assetManager', async () => {

            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

            try {
                const tx = await marketLogic.methods.createDemand("propertiesDocumentHash", "documentDBURL")
                    .send({ from: TestAccounts.assetManager, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

        })

        it('should not be possible to create a demand as agreementAdmin', async () => {

            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)

            try {
                const tx = await marketLogic.methods.createDemand("propertiesDocumentHash", "documentDBURL")
                    .send({ from: TestAccounts.agreementAdmin, gas: 7000000, gasPrice: 0 })
            }
            catch (e) {

            }
            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 0)
        })

        it('should  be possible to create a demand as Trader', async () => {

            const tx = await marketLogic.methods.createDemand("propertiesDocumentHash", "documentDBURL")
                .send({ from: TestAccounts.trader, gas: 7000000, gasPrice: 0 })

            const event = tx.events.createdNewDemand
            assert.equal(event.event, "createdNewDemand")
            assert.deepEqual({
                '0': TestAccounts.trader,
                '1': '0',
                _sender: TestAccounts.trader,
                _demandId: '0'
            }, event.returnValues)

            assert.equal(await marketLogic.methods.getAllDemandListLength().call(), 1)

        })

    })

});
*/
