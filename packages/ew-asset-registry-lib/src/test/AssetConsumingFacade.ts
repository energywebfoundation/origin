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

import { assert } from 'chai';
import 'mocha';
import Web3Type from '../types/web3';
import * as TestAccounts from '../utils/testing/TestAccounts'
import { makeSnapshot, revertSnapshot } from '../utils/testing/utils'
import { prepare } from '../utils/testing/preparation'
import * as ConsumingAsset from '../blockchain-facade/ConsumingAsset';
import * as Asset from '../blockchain-facade/Asset';
import * as Configuration from '../blockchain-facade/Configuration';
import { AssetConsumingRegistryLogic } from '../contractWrapper/AssetConsumingRegistryLogic';
import { logger } from './Logger';

const Web3 = require('web3')



describe('AssetConsumingLogic Facade', () => {
    let web3: Web3Type;
    let snapShotId: Number

    let conf: Configuration.Entity

    const init = async () => {
        web3 = new Web3('http://localhost:8545')
    }

    before(async () => {
        await init();
        snapShotId = await makeSnapshot(web3)
        await prepare(web3)
        debugger
    });

    after(async () => {
        await revertSnapshot(snapShotId, web3)
    });

    it('should create an asset', async () => {

        const assetProps: Asset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: TestAccounts.smartMeter },
            owner: { address: TestAccounts.assetManager },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: "lastSmartMeterReadFileHash",
            matcher: [{ address: TestAccounts.matcher }],
            propertiesDocumentHash: null,
            url: null
        }

        conf = {
            blockchainProperties: {
                web3: web3,
                consumingAssetLogicInstance: new AssetConsumingRegistryLogic(web3),
                activeUser: {
                    address: TestAccounts.assetAdmin, privateKey: "0x" + TestAccounts.assetAdminPK
                }
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030'
            },
            logger: logger

        }

        const assetPropsOffChain: Asset.OffChainProperties = {
            operationalSince: 0,
            capacityWh: 10,
            country: "bla",
            region: "bla",
            zip: "bla",
            city: "bla",
            street: "bla",
            houseNumber: "bla",
            gpsLatitude: "bla",
            gpsLongitude: "bla"
        }

        assert.equal(await ConsumingAsset.getAssetListLength(conf), 0)

        const asset = await ConsumingAsset.createAsset(assetProps,assetPropsOffChain, conf)
        delete asset.configuration
        delete asset.proofs
        delete asset.propertiesDocumentHash

        assert.deepEqual({
            id: '0',
            initialized: true,
            certificatesUsedForWh: '0',
            smartMeter: { address: TestAccounts.smartMeter },
            owner: { address: TestAccounts.assetManager },
            lastSmartMeterReadWh: '0',
            active: true,
            lastSmartMeterReadFileHash: '',
            matcher: [{ address: [TestAccounts.matcher] }],
            offChainProperties: assetPropsOffChain,
            url: 'http://localhost:3030/ConsumingAsset'
        } as any, asset)
        assert.equal(await ConsumingAsset.getAssetListLength(conf), 1)

    })



});

