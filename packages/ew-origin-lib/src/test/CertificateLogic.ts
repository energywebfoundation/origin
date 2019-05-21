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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import {
    migrateUserRegistryContracts,
    UserLogic,
    UserContractLookup
} from 'ew-user-registry-lib';
import {
    migrateAssetRegistryContracts,
    AssetContractLookup,
    AssetProducingRegistryLogic
} from 'ew-asset-registry-lib';
import {
    OriginContractLookup,
    CertificateLogic,
    migrateCertificateRegistryContracts
} from '..';
import * as Certificate from '..';
import * as GeneralLib from 'ew-utils-general-lib';
import { logger } from '../blockchain-facade/Logger';
import * as Asset from 'ew-asset-registry-lib';
import {
    deployERC20TestToken,
    Erc20TestToken,
    TestReceiver,
    deployERC721TestReceiver
} from 'ew-erc-test-contracts';
import Web3 from 'web3';

describe('CertificateLogic-Facade', () => {
    let userLogic: UserLogic;
    let certificateLogic: CertificateLogic;
    let assetRegistry: AssetProducingRegistryLogic;
    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let userRegistryContract: UserContractLookup;

    let erc20TestToken: Erc20TestToken;
    let testReceiver: TestReceiver;

    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

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

    let blockceationTime;

    it('should deploy the contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3 as any, privateKeyDeployment);
        userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.setUser(accountDeployment, 'admin', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountDeployment, 3, { privateKey: privateKeyDeployment });

        const userContractLookupAddr = (userContracts as any).UserContractLookup;

        userRegistryContract = new UserContractLookup(web3 as any, userContractLookupAddr);
        const assetContracts = await migrateAssetRegistryContracts(
            web3 as any,
            userContractLookupAddr,
            privateKeyDeployment
        );

        const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

        const assetProducingAddr = (assetContracts as any).AssetProducingRegistryLogic;
        const originContracts = await migrateCertificateRegistryContracts(
            web3 as any,
            assetRegistryLookupAddr,
            privateKeyDeployment
        );

        assetRegistryContract = new AssetContractLookup(web3 as any, assetRegistryLookupAddr);
        assetRegistry = new AssetProducingRegistryLogic(web3 as any, assetProducingAddr);

        Object.keys(originContracts).forEach(async key => {
            if (key.includes('OriginContractLookup')) {
                originRegistryContract = new OriginContractLookup(
                    web3 as any,
                    originContracts[key]
                );
            }

            if (key.includes('CertificateLogic')) {
                certificateLogic = new CertificateLogic(web3 as any, originContracts[key]);
            }
        });

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                producingAssetLogicInstance: assetRegistry,
                userLogicInstance: userLogic,
                certificateLogicInstance: certificateLogic,
                web3
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030'
            },
            logger
        };
    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.Certificate.getCertificateListLength(conf), 0);
        assert.equal(await Certificate.TradableEntity.getBalance(accountAssetOwner, conf), 0);
        assert.equal(await Certificate.TradableEntity.getBalance(accountTrader, conf), 0);
    });

    it('should onboard tests-users', async () => {
        await userLogic.setUser(accountAssetOwner, 'assetOwner', {
            privateKey: privateKeyDeployment
        });

        await userLogic.setUser(accountTrader, 'trader', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountTrader, 24, { privateKey: privateKeyDeployment });
        await userLogic.setRoles(accountAssetOwner, 24, { privateKey: privateKeyDeployment });
    });

    it('should onboard a new asset', async () => {
        const assetProps: Asset.ProducingAsset.OnChainProperties = {
            smartMeter: { address: assetSmartmeter },
            owner: { address: accountAssetOwner },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: matcherAccount }],
            propertiesDocumentHash: null,
            url: null,
            maxOwnerChanges: 3
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
            typeOfPublicSupport: ''
        };

        assert.equal(await Asset.ProducingAsset.getAssetListLength(conf), 0);

        await Asset.ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    });

    it('should set marketcontract in asset + log a new meterreading ', async () => {
        await assetRegistry.setMarketLookupContract(
            0,
            originRegistryContract.web3Contract._address,
            { privateKey: assetOwnerPK }
        );

        await assetRegistry.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', {
            privateKey: assetSmartmeterPK
        });
    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.Certificate.getCertificateListLength(conf), 1);
        assert.equal(await Certificate.TradableEntity.getBalance(accountAssetOwner, conf), 1);
        assert.equal(await Certificate.TradableEntity.getBalance(accountTrader, conf), 0);
    });

    it('should return certificate', async () => {
        const certificate = await new Certificate.Certificate.Entity('0', conf).sync();
        assert.equal(await certificate.getOwner(), accountAssetOwner);

        delete certificate.configuration;
        delete certificate.proofs;

        blockceationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '0',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '0',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should transfer certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        let certificate = await new Certificate.Certificate.Entity('0', conf).sync();

        await certificate.transferFrom(accountTrader);

        certificate = await new Certificate.Certificate.Entity('0', conf).sync();

        assert.equal(await Certificate.Certificate.getCertificateListLength(conf), 1);
        assert.equal(await Certificate.TradableEntity.getBalance(accountAssetOwner, conf), 0);
        assert.equal(await Certificate.TradableEntity.getBalance(accountTrader, conf), 1);
        assert.equal(await certificate.getOwner(), accountTrader);
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '0',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountTrader,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '0',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1'
        });
    });

    it('create a new certificate (#1)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 200, 'lastSmartMeterReadFileHash', {
            privateKey: assetSmartmeterPK
        });
        const certificate = await new Certificate.Certificate.Entity('1', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockceationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should approve', async () => {
        let certificate = await new Certificate.Certificate.Entity('1', conf).sync();

        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000000');

        await certificate.approve('0x0000000000000000000000000000000000000001');
        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000001');

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;
        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000001',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should set erc20-token and price for a certificate', async () => {
        let certificate = await new Certificate.Certificate.Entity('1', conf).sync();

        await certificate.setOnChainDirectPurchasePrice(100);

        assert.equal(await certificate.getOnChainDirectPurchasePrice(), 100);

        certificate = await certificate.sync();

        assert.equal(certificate.onCHainDirectPurchasePrice, 100);

        const erc20TestAddress = (await deployERC20TestToken(
            web3,
            accountTrader,
            privateKeyDeployment
        )).contractAddress;

        erc20TestToken = new Erc20TestToken(web3, erc20TestAddress);

        await certificate.setTradableToken(erc20TestAddress);

        certificate = await certificate.sync();

        assert.equal(await certificate.getTradableToken(), erc20TestAddress);
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: erc20TestAddress,
            onCHainDirectPurchasePrice: '100',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000001',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should fail buying a certificate when not enough erc20 tokens approved', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };

        const certificate = await new Certificate.Certificate.Entity('1', conf).sync();

        let failed = false;

        try {
            await certificate.buyCertificate();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'erc20 transfer failed');
        }

        assert.isTrue(failed);
    });

    it('should buying a certificate when enough erc20 tokens are approved', async () => {
        await erc20TestToken.approve(accountAssetOwner, 100, { privateKey: traderPK });

        let certificate = await new Certificate.Certificate.Entity('1', conf).sync();

        await certificate.buyCertificate();
        certificate = await certificate.sync();

        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountTrader,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockceationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1'
        });
    });

    it('should create a new certificate (#2)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash#3', {
            privateKey: assetSmartmeterPK
        });
        const certificate = await new Certificate.Certificate.Entity('2', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockceationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '2',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should split a certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

        let certificate = await new Certificate.Certificate.Entity('2', conf).sync();

        await certificate.splitCertificate(60);

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '2',
            initialized: true,
            assetId: '0',
            children: ['3', '4'],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });

        const c1 = await new Certificate.Certificate.Entity('3', conf).sync();
        delete c1.configuration;
        delete c1.proofs;

        const c2 = await new Certificate.Certificate.Entity('4', conf).sync();
        delete c2.configuration;
        delete c2.proofs;

        assert.deepEqual(c1 as any, {
            id: '3',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '60',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });

        assert.deepEqual(c2 as any, {
            id: '4',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '40',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should retire a certificate', async () => {
        let certificate = await new Certificate.Certificate.Entity('3', conf).sync();

        await certificate.retireCertificate();

        certificate = await certificate.sync();

        assert.isTrue(await certificate.isRetired());
        assert.equal(await certificate.getCertificateOwner(), accountAssetOwner);

        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '3',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '60',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: true,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should fail when trying to remove a non-existing matcher of a certificate', async () => {
        let certificate = await new Certificate.Certificate.Entity('4', conf).sync();

        let failed = false;
        try {
            await certificate.removeEscrow(accountTrader);
        } catch (ex) {
            assert.include(ex.message, 'escrow address not in array');
            failed = true;
        }

        assert.isTrue(failed);
        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '4',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '40',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should remove matcher of a certificate', async () => {
        let certificate = await new Certificate.Certificate.Entity('4', conf).sync();

        await certificate.removeEscrow(matcherAccount);

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '4',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '40',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should add a matcher to a certificate', async () => {
        let certificate = await new Certificate.Certificate.Entity('4', conf).sync();

        await certificate.addEscrowForEntity(matcherAccount);

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '4',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '40',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockceationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should create a new certificate (#5)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 400, 'lastSmartMeterReadFileHash#4', {
            privateKey: assetSmartmeterPK
        });
        const certificate = await new Certificate.Certificate.Entity('5', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockceationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '5',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#4',
            creationTime: blockceationTime,
            parentId: '5',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should fail using safeTransferFrom without calldata to an address', async () => {
        const certificate = await new Certificate.Certificate.Entity('5', conf).sync();

        let failed = false;

        try {
            await certificate.safeTransferFrom(accountTrader);
        } catch (ex) {
            assert.include(ex.message, '_to is not a contract');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should be able to use safeTransferFrom without calldata', async () => {
        const testReceiverAddress = (await deployERC721TestReceiver(
            web3,
            certificateLogic.web3Contract.options.address,
            privateKeyDeployment
        )).contractAddress;

        testReceiver = new TestReceiver(web3, testReceiverAddress);

        await userLogic.setUser(testReceiverAddress, 'testReceiverAddress', {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(testReceiverAddress, 24, { privateKey: privateKeyDeployment });
        let certificate = await new Certificate.Certificate.Entity('5', conf).sync();

        await certificate.safeTransferFrom(testReceiverAddress);

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '5',
            initialized: true,
            assetId: '0',
            children: [],
            owner: testReceiverAddress,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#4',
            creationTime: blockceationTime,
            parentId: '5',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1'
        });
    });

    it('should create a new certificate (#6)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 500, 'lastSmartMeterReadFileHash#5', {
            privateKey: assetSmartmeterPK
        });
        const certificate = await new Certificate.Certificate.Entity('6', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockceationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '6',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#5',
            creationTime: blockceationTime,
            parentId: '6',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0'
        });
    });

    it('should fail using safeTransferFrom calldata to an address', async () => {
        const certificate = await new Certificate.Certificate.Entity('6', conf).sync();

        let failed = false;

        try {
            await certificate.safeTransferFrom(accountTrader, '0x001');
        } catch (ex) {
            assert.include(ex.message, '_to is not a contract');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should be able to use safeTransferFrom', async () => {
        const testReceiverAddress = (await deployERC721TestReceiver(
            web3,
            certificateLogic.web3Contract.options.address,
            privateKeyDeployment
        )).contractAddress;

        testReceiver = new TestReceiver(web3, testReceiverAddress);

        await userLogic.setUser(testReceiverAddress, 'testReceiverAddress', {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(testReceiverAddress, 24, { privateKey: privateKeyDeployment });
        let certificate = await new Certificate.Certificate.Entity('6', conf).sync();

        await certificate.safeTransferFrom(testReceiverAddress, '0x001');

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '6',
            initialized: true,
            assetId: '0',
            children: [],
            owner: testReceiverAddress,
            powerInW: '100',
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onCHainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            retired: false,
            dataLog: 'lastSmartMeterReadFileHash#5',
            creationTime: blockceationTime,
            parentId: '6',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1'
        });

        let allEvents = await Certificate.Certificate.getAllCertificateEvents(0, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
       */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(1, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
        */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(2, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
        */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(3, conf);
        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
        */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(4, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
        */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(5, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }
        console.log('-----------------');
        */
        allEvents = await Certificate.Certificate.getAllCertificateEvents(6, conf);

        /*
        for (let i = 0; i < allEvents.length; i++) {
            console.log('');
            console.log((allEvents as any)[i].event);
            console.log((allEvents as any)[i].returnValues);
            console.log((allEvents as any)[i].raw.topics);
            console.log('');
        }*/
        //        console.log(allEvents);
    });
});
