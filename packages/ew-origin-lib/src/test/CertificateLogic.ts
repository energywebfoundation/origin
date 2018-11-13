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
import * as fs from 'fs';
import 'mocha';
import { Web3Type } from '../types/web3';
import { migrateUserRegistryContracts, UserLogic, UserContractLookup } from 'ew-user-registry-contracts';
import { migrateAssetRegistryContracts, AssetContractLookup, AssetProducingRegistryLogic } from 'ew-asset-registry-contracts';
import { OriginContractLookup, CertificateLogic, migrateCertificateRegistryContracts } from 'ew-origin-contracts';
import * as Certificate from '..';
import * as GeneralLib from 'ew-utils-general-lib';
import { logger } from '../blockchain-facade/Logger';
import * as Asset from 'ew-asset-registry-lib';

describe('CertificateLogic-Facade', () => {

    let userLogic: UserLogic;
    let certificateLogic: CertificateLogic;
    let assetRegistry: AssetProducingRegistryLogic;
    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let userRegistryContract: UserContractLookup;

    const configFile = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8'));

    const Web3 = require('web3');
    const web3: Web3Type = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x') ?
        configFile.develop.deployKey : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const assetOwnerPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0xd9d5e7a2ebebbad1eb22a63baa739a6c6a6f15d07fcc990ea4dea5c64022a87a';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const approvedPK = '0x7da67da863672d4cc2984e93ce28d98b0d782d8caa43cd1c977b919c0209541b';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    let conf: GeneralLib.Configuration.Entity;

    it('should deploy the contracts', async () => {

        const userContracts = await migrateUserRegistryContracts((web3 as any));

        userLogic = new UserLogic((web3 as any),
                                  userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserLogic.json']);

        await userLogic.setUser(accountDeployment, 'admin', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountDeployment, 3, { privateKey: privateKeyDeployment });

        const userContractLookupAddr = userContracts[process.cwd() + '/node_modules/ew-user-registry-contracts/dist/contracts/UserContractLookup.json'];

        userRegistryContract = new UserContractLookup((web3 as any), userContractLookupAddr);
        const assetContracts = await migrateAssetRegistryContracts((web3 as any), userContractLookupAddr);

        const assetRegistryLookupAddr = assetContracts[process.cwd() + '/node_modules/ew-asset-registry-contracts/dist/contracts/AssetContractLookup.json'];

        const assetProducingAddr = assetContracts[process.cwd() + '/node_modules/ew-asset-registry-contracts/dist/contracts/AssetProducingRegistryLogic.json'];
        const originContracts = await migrateCertificateRegistryContracts((web3 as any), assetRegistryLookupAddr);

        assetRegistryContract = new AssetContractLookup((web3 as any), assetRegistryLookupAddr);
        originRegistryContract = new OriginContractLookup((web3 as any), originContracts[process.cwd() + '/node_modules/ew-origin-contracts/dist/contracts/OriginContractLookup.json']);
        certificateLogic = new CertificateLogic((web3 as any), originContracts[process.cwd() + '/node_modules/ew-origin-contracts/dist/contracts/CertificateLogic.json']);
        assetRegistry = new AssetProducingRegistryLogic((web3 as any), assetProducingAddr);

        Object.keys(originContracts).forEach(async (key) => {

            const deployedBytecode = await web3.eth.getCode(originContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            const contractInfo = JSON.parse(fs.readFileSync(key, 'utf8'));

            const tempBytecode = '0x' + contractInfo.deployedBytecode;
            assert.equal(deployedBytecode, tempBytecode);

        });

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment, privateKey: privateKeyDeployment,
                },
                producingAssetLogicInstance: assetRegistry,
                certificateLogicInstance: certificateLogic,
                userLogicInstance: userLogic,
                web3,
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030',
            },
            logger,
        };

    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.Certificate.getCertificateListLength(conf), 0);
        assert.equal(await Certificate.Certificate.getBalance(accountAssetOwner, conf), 0);
        assert.equal(await Certificate.Certificate.getBalance(accountTrader, conf), 0);

    });

    it('should onboard tests-users', async () => {

        await userLogic.setUser(accountAssetOwner, 'assetOwner', { privateKey: privateKeyDeployment });
        await userLogic.setRoles(accountAssetOwner, 8, { privateKey: privateKeyDeployment });
    });

    it('should onboard a new asset', async () => {

        const assetProps: Asset.ProducingAsset.OnChainProperties = {
            certificatesUsedForWh: 0,
            smartMeter: { address: assetSmartmeter },
            owner: { address: accountAssetOwner },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: matcherAccount }],
            propertiesDocumentHash: null,
            url: null,
            certificatesCreatedForWh: 0,
            lastSmartMeterCO2OffsetRead: 0,
            maxOwnerChanges: 3,
        };

        const assetPropsOffChain: Asset.ProducingAsset.OffChainProperties = {
            operationalSince: 0,
            capacityWh: 10,
            country: 'USA',
            region: 'AnyState',
            zip: '012345',
            city: 'Anytown',
            street: 'Main-Street',
            houseNumber: '42',
            gpsLatitude: '0.0123123',
            gpsLongitude: '31.1231',
            assetType: Asset.ProducingAsset.Type.Wind,
            complianceRegistry: Asset.ProducingAsset.Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
        };

        assert.equal(await Asset.ProducingAsset.getAssetListLength(conf), 0);

        await Asset.ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    });

    it('should set marketcontract in asset + log a new meterreading ', async () => {

        await assetRegistry.setMarketLookupContract(0, originRegistryContract.web3Contract._address,
                                                    { privateKey: assetOwnerPK });

        await assetRegistry.saveSmartMeterRead(
            0,
            100,
            'lastSmartMeterReadFileHash',
            { privateKey: assetSmartmeterPK });

    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.Certificate.getCertificateListLength(conf), 1);
        assert.equal(await Certificate.Certificate.getBalance(accountAssetOwner, conf), 1);
        assert.equal(await Certificate.Certificate.getBalance(accountTrader, conf), 0);

    });

    it('should return certificate', async () => {

        const certificate = await (new Certificate.Certificate.Entity('0', conf).sync());

        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '0',
            initialized: true,
            assetId: '0',
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: '' + (await web3.eth.getBlock('latest')).timestamp,
            parentId: '0',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
        });

    });

});