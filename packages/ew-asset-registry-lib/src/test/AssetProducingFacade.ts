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
import * as TestAccounts from '../utils/testing/TestAccounts';
import { makeSnapshot, revertSnapshot, getInstanceFromBuild } from '../utils/testing/utils';
import { prepare } from '../utils/testing/preparation';
import * as Configuration from '../blockchain-facade/Configuration';
import * as ProducingAsset from '../blockchain-facade/ProducingAsset';
import { AssetProducingRegistryLogic } from '../contractWrapper/AssetProducingRegistryLogic';
import { CertificateLogic } from '../contractWrapper/CertificateLogic';
import * as Certificate from '../blockchain-facade/Trading/Certificate';
import {OffChainProperties as AssetOffChainProperties} from '../blockchain-facade/Asset';

import axios from 'axios';
import { PreciseProofs } from '../../node_modules/precise-proofs/dist/js';
import { logger } from './Logger';

const Web3 = require('web3');

describe('AssetProducing Facade', () => {
    let web3: Web3Type;
    let snapShotId: Number;

    let conf: Configuration.Entity;
    let proofs: PreciseProofs.Proof[];

    const init = async () => {
        web3 = new Web3('http://localhost:8545');
    };

    before(async () => {
        await init();
        snapShotId = await makeSnapshot(web3);
        await prepare(web3);
        debugger;
    });

    after(async () => {
        await revertSnapshot(snapShotId, web3);
    });

    it('should create an asset', async () => {

        const assetProps: ProducingAsset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: TestAccounts.smartMeter },
            owner: { address: TestAccounts.assetManager },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: TestAccounts.matcher }],
            propertiesDocumentHash: null,
            url: null,
            certificatesCreatedForWh: 0,
            lastSmartMeterCO2OffsetRead: 0,
            maxOwnerChanges: 3,
        };

        const assetPropsOffChain: ProducingAsset.OffChainProperties = {
            operationalSince: 0,
            capacityWh: 10,
            country: 'bla',
            region: 'bla',
            zip: 'bla',
            city: 'bla',
            street: 'bla',
            houseNumber: 'bla',
            gpsLatitude: 'bla',
            gpsLongitude: 'bla',
            assetType: ProducingAsset.Type.Wind,
            complianceRegistry: ProducingAsset.Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
        };

        conf = {
            blockchainProperties: {
                web3,
                producingAssetLogicInstance: new AssetProducingRegistryLogic(web3),
                certificateLogicInstance: new CertificateLogic(web3),
                activeUser: {
                    address: TestAccounts.assetAdmin, privateKey: '0x' + TestAccounts.assetAdminPK,
                },
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030',
            },
            logger,
              
        };
        assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

        const asset = await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
        proofs = [...asset.proofs];

        delete asset.configuration;
        delete asset.proofs;
        delete asset.propertiesDocumentHash;

        assert.deepEqual({
            id: '0',
            initialized: false,
            certificatesUsedForWh: '0',
            smartMeter: TestAccounts.smartMeter,
            owner: TestAccounts.assetManager,
            lastSmartMeterReadWh: '0',
            active: true,
            lastSmartMeterReadFileHash: '',
            matcher: [TestAccounts.matcher],
            certificatesCreatedForWh: '0',
            lastSmartMeterCO2OffsetRead: '0',
            maxOwnerChanges: '3',
            url: `${conf.offChainDataSource.baseUrl}/ProducingAsset`,
            offChainProperties: assetPropsOffChain,
        } as any,        asset);

        assert.equal(await ProducingAsset.getAssetListLength(conf), 1);
    });

    it('should throw on invalid json', async () => {

        const assetProps: ProducingAsset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: TestAccounts.smartMeter },
            owner: { address: TestAccounts.assetManager },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: TestAccounts.matcher }],
            propertiesDocumentHash: null,
            url: null,
            certificatesCreatedForWh: 0,
            lastSmartMeterCO2OffsetRead: 0,
            maxOwnerChanges: 3,
        };

        const assetPropsOffChain: any = {
            operationalSince: 0,
            capacityWh: 10,
            country: 1234,
            region: 'bla',
            zip: 'bla',
            city: 'bla',
            street: 'bla',
            houseNumber: 'bla',
            gpsLatitude: 'bla',
            gpsLongitude: 'bla',
        };

        conf = {
            blockchainProperties: {
                web3,
                producingAssetLogicInstance: new AssetProducingRegistryLogic(web3),
                certificateLogicInstance: new CertificateLogic(web3),
                activeUser: {
                    address: TestAccounts.assetAdmin, privateKey: '0x' + TestAccounts.assetAdminPK,
                },
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030',
            },
            logger,
        };

        try {
            const asset = await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
            assert.fail(0, 1, 'Exception not thrown');
        } catch (e) {
            assert.ok(e.message, 'http://localhost:3030/ProducingAsset json is invalid\n0. error at 1234');
        }
       
    });

    it('should throw on corrupt data source', async () => {

        conf = {
            blockchainProperties: {
                web3,
                producingAssetLogicInstance: new AssetProducingRegistryLogic(web3),
                certificateLogicInstance: new CertificateLogic(web3),
                activeUser: {
                    address: TestAccounts.assetAdmin, privateKey: '0x' + TestAccounts.assetAdminPK,
                },
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030',
            },
            logger,
        };
        
        const url = `${conf.offChainDataSource.baseUrl}/ProducingAsset`;
        const data = (await axios.get(url + '/0')as any).data;
        data.properties.operationalSince = 1;
        await axios.put(url + '/0', data);

        const asset = await new ProducingAsset.Entity('0', conf);
        
        let thrown = false;
        await asset.sync().catch((e) => {
            assert.equal(e.message, 'Proof for property operationalSince is invalid.');
            thrown = true;
        });
        if (!thrown) {
            assert.fail(0, 1, 'Exception not thrown');
        }
        
    });

    it('should create certificates', async () => {

        assert.equal(await Certificate.getCertificateListLength(conf), 0);

        //   let cert1 = await new Certificate(0, blockchainProps).sync()
        //   console.log(cert1)
        await conf.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(0, 100, false, 'newFileHash', 100, false, { from: TestAccounts.smartMeter, privateKey: '0x' + TestAccounts.smartMeterPK });

        const cert1 = await new Certificate.Entity(0, conf).sync();
        delete cert1.configuration;
        delete cert1.creationTime;
        //   console.log(cert1)
        assert.deepEqual({
            id: 0,
            assetId: '0',
            owner: TestAccounts.assetManager,
            powerInW: '100',
            retired: false,
            dataLog: 'newFileHash',
            coSaved: '100',
            escrow: [TestAccounts.matcher],
            parentId: '0',
            children: [],
            maxOwnerChanges: '3',
            ownerChangeCounter: '0',
        } as any,        cert1);
        assert.equal(await Certificate.getCertificateListLength(conf), 1);

        await conf.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(0, 200, false, 'newFileHash2', 200, false, { from: TestAccounts.smartMeter, privateKey: '0x' + TestAccounts.smartMeterPK });
        const cert2 = await new Certificate.Entity(1, conf).sync();
        delete cert2.configuration;
        delete cert2.creationTime;
        assert.deepEqual({
            id: 1,
            assetId: '0',
            owner: TestAccounts.assetManager,
            powerInW: '100',
            retired: false,
            dataLog: 'newFileHash2',
            coSaved: '100',
            escrow: [TestAccounts.matcher],
            parentId: '1',
            children: [],
            maxOwnerChanges: '3',
            ownerChangeCounter: '0',
        } as any,        cert2);
        assert.equal(await Certificate.getCertificateListLength(conf), 2);

    });

});
