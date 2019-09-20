import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';

import { UserLogic, UserContractLookup, Role, buildRights } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import {
    AssetContractLookup,
    AssetProducingRegistryLogic,
    ProducingAsset
} from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { Configuration, Currency, Compliance } from '@energyweb/utils-general';
import {
    deployERC20TestToken,
    Erc20TestToken,
    TestReceiver,
    deployERC721TestReceiver
} from '@energyweb/erc-test-contracts';

import { OriginContractLookup, CertificateLogic } from '..';
import { migrateCertificateRegistryContracts } from '../../contracts';
import * as Certificate from '../blockchain-facade/Certificate';
import * as TradableEntity from '../blockchain-facade/TradableEntity';
import { logger } from '../blockchain-facade/Logger';

describe('CertificateLogic-Facade', () => {
    let userLogic: UserLogic;
    let certificateLogic: CertificateLogic;
    let assetRegistry: AssetProducingRegistryLogic;
    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let userRegistryContract: UserContractLookup;

    let erc20TestToken: Erc20TestToken;
    let erc20TestTokenAddress: string;
    let testReceiver: TestReceiver;

    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const assetSmartmeterPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const approvedPK = '0x60a0dae29ff80793b6cc1602f60fbe548b6787d0f9d4eb7c0967dac8ff11591a';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    let conf: Configuration.Entity;
    let blockCreationTime;

    function setActiveUser(privateKey) {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    }

    it('should set ERC20 token', async () => {
        erc20TestTokenAddress = (await deployERC20TestToken(
            web3,
            accountTrader,
            privateKeyDeployment
        )).contractAddress;

        erc20TestToken = new Erc20TestToken(web3, erc20TestTokenAddress);
    });

    it('should deploy the contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3 as any, privateKeyDeployment);
        userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            accountDeployment,
            buildRights([Role.UserAdmin, Role.AssetAdmin]),
            { privateKey: privateKeyDeployment }
        );

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

        for (const key of Object.keys(originContracts)) {
            if (key.includes('OriginContractLookup')) {
                originRegistryContract = new OriginContractLookup(
                    web3 as any,
                    originContracts[key]
                );
            }

            if (key.includes('CertificateLogic')) {
                certificateLogic = new CertificateLogic(web3 as any, originContracts[key]);
            }
        }

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
        assert.equal(await Certificate.getCertificateListLength(conf), 0);
        assert.equal(await TradableEntity.getBalance(accountAssetOwner, conf), 0);
        assert.equal(await TradableEntity.getBalance(accountTrader, conf), 0);
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountAssetOwner,
            'assetOwner',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountTrader,
            'trader',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(accountTrader, buildRights([Role.Trader]), {
            privateKey: privateKeyDeployment
        });
        await userLogic.setRoles(accountAssetOwner, buildRights([Role.AssetManager, Role.Trader]), {
            privateKey: privateKeyDeployment
        });

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            issuerAccount,
            'issuer',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(issuerAccount, buildRights([Role.Issuer]), {
            privateKey: privateKeyDeployment
        });
    });

    it('should onboard a new asset', async () => {
        const assetProps: ProducingAsset.IOnChainProperties = {
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

        const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
            facilityName: 'TestFacility',
            operationalSince: 0,
            capacityWh: 10,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '14.059500',
            gpsLongitude: '99.977800',
            assetType: 'Wind',
            complianceRegistry: Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: ''
        };

        assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

        await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    });

    it('should set marketcontract in asset + log a new meterreading ', async () => {
        await assetRegistry.setMarketLookupContract(
            0,
            originRegistryContract.web3Contract._address,
            { privateKey: assetOwnerPK }
        );

        await assetRegistry.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', 0, {
            privateKey: assetSmartmeterPK
        });
    });

    it('should be able to request certificates', async () => {
        await certificateLogic.requestCertificates(0, 0, {
            privateKey: assetOwnerPK
        });
    });

    it('should be able to approve certification request', async () => {
        await certificateLogic.approveCertificationRequest(0, {
            privateKey: issuerPK
        });

        assert.equal(await Certificate.getCertificateListLength(conf), 1);
        assert.equal(await TradableEntity.getBalance(accountAssetOwner, conf), 1);
        assert.equal(await TradableEntity.getBalance(accountTrader, conf), 0);
    });

    it('should return certificate', async () => {
        const certificate = await new Certificate.Entity('0', conf).sync();
        assert.equal(await certificate.getOwner(), accountAssetOwner);

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '0',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '0',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should fail unpublish certificate from sale if not on sale', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        const certificate = await new Certificate.Entity('0', conf).sync();

        let failed = false;

        try {
            await certificate.unpublishForSale();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'forSale flag is already set to the required value');
        }

        assert.isTrue(failed);
    });

    it('should make certificate available for sale', async () => {
        let certificate = await new Certificate.Entity('0', conf).sync();

        await certificate.publishForSale(10, '0x1230000000000000000000000000000000000000');

        certificate = await new Certificate.Entity('0', conf).sync();
        assert.isTrue(certificate.forSale);
    });

    it('should fail unpublish certificate from sale if not the owner', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };
        const certificate = await new Certificate.Entity('0', conf).sync();

        let failed = false;

        try {
            await certificate.unpublishForSale();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'not the entity-owner');
        }

        assert.isTrue(failed);
    });

    it('should fail putting certificate for sale if already on sale', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        const certificate = await new Certificate.Entity('0', conf).sync();

        let failed = false;

        try {
            await certificate.publishForSale(10, '0x1230000000000000000000000000000000000000');
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'forSale flag is already set to the required value');
        }

        assert.isTrue(failed);
    });

    it('should unpublish certificate available from sale', async () => {
        let certificate = await new Certificate.Entity('0', conf).sync();

        await certificate.unpublishForSale();

        certificate = await new Certificate.Entity('0', conf).sync();
        assert.isFalse(certificate.forSale);
    });

    it('should transfer certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        let certificate = await new Certificate.Entity('0', conf).sync();

        await certificate.transferFrom(accountTrader);

        certificate = await new Certificate.Entity('0', conf).sync();

        assert.equal(await Certificate.getCertificateListLength(conf), 1);
        assert.equal(await TradableEntity.getBalance(accountAssetOwner, conf), 0);
        assert.equal(await TradableEntity.getBalance(accountTrader, conf), 1);
        assert.equal(await certificate.getOwner(), accountTrader);
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '0',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountTrader,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '0',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('create a new certificate (#1)', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        await assetRegistry.saveSmartMeterRead(0, 200, 'lastSmartMeterReadFileHash', 0, {
            privateKey: assetSmartmeterPK
        });
        await certificateLogic.requestCertificates(0, 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(1, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('1', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should approve', async () => {
        let certificate = await new Certificate.Entity('1', conf).sync();

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
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000001',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should set erc20-token and price for a certificate', async () => {
        let certificate = await new Certificate.Entity('1', conf).sync();

        await certificate.setOnChainDirectPurchasePrice(100);

        assert.equal(await certificate.getOnChainDirectPurchasePrice(), 100);

        certificate = await certificate.sync();

        assert.equal(certificate.onChainDirectPurchasePrice, 100);

        await certificate.setTradableToken(erc20TestTokenAddress);

        certificate = await certificate.sync();

        assert.equal(await certificate.getTradableToken(), erc20TestTokenAddress);
        delete certificate.configuration;
        delete certificate.proofs;

        assert.deepEqual(certificate as any, {
            id: '1',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: erc20TestTokenAddress,
            onChainDirectPurchasePrice: '100',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000001',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should fail buying a certificate when not for sale', async () => {
        setActiveUser(traderPK);

        const certificate = await new Certificate.Entity('1', conf).sync();

        let failed = false;

        try {
            await certificate.buyCertificate();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'Unable to buy a certificate that is not for sale');
        }

        assert.isTrue(failed);
    });

    it('should make certificate 1 available for sale', async () => {
        setActiveUser(assetOwnerPK);

        let certificate = await new Certificate.Entity('1', conf).sync();

        await certificate.publishForSale(10, erc20TestTokenAddress);

        certificate = await new Certificate.Entity('1', conf).sync();

        assert.isTrue(certificate.forSale);
    });

    it('should fail buying a certificate when not enough erc20 tokens approved', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };

        const certificate = await new Certificate.Entity('1', conf).sync();

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

        let certificate = await new Certificate.Entity('1', conf).sync();

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
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash',
            creationTime: blockCreationTime,
            parentId: '1',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should create a new certificate (#2)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash#3', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 2, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(2, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('2', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '2',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should split a certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

        let certificate = await new Certificate.Entity('2', conf).sync();

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
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Split.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });

        const c1 = await new Certificate.Entity('3', conf).sync();
        delete c1.configuration;
        delete c1.proofs;

        const c2 = await new Certificate.Entity('4', conf).sync();
        delete c2.configuration;
        delete c2.proofs;

        assert.deepEqual(c1 as any, {
            id: '3',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 60,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });

        assert.deepEqual(c2 as any, {
            id: '4',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 40,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });

        const activeCerts = await Certificate.getActiveCertificates(conf);
        const activeIndices = activeCerts.map(cert => cert.id);

        assert.equal(activeIndices.indexOf(certificate.id), -1);
        assert.notEqual(activeIndices.indexOf(c1.id), -1);
        assert.notEqual(activeIndices.indexOf(c2.id), -1);
    });

    it('should retire a certificate', async () => {
        let certificate = await new Certificate.Entity('3', conf).sync();

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
            powerInW: 60,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Retired.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should fail when trying to remove a non-existing matcher of a certificate', async () => {
        let certificate = await new Certificate.Entity('4', conf).sync();

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
            powerInW: 40,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should remove matcher of a certificate', async () => {
        let certificate = await new Certificate.Entity('4', conf).sync();

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
            powerInW: 40,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should add a matcher to a certificate', async () => {
        let certificate = await new Certificate.Entity('4', conf).sync();

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
            powerInW: 40,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#3',
            creationTime: blockCreationTime,
            parentId: '2',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should create a new certificate (#5)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 400, 'lastSmartMeterReadFileHash#4', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 3, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(3, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('5', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '5',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#4',
            creationTime: blockCreationTime,
            parentId: '5',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should fail using safeTransferFrom without calldata to an address', async () => {
        const certificate = await new Certificate.Entity('5', conf).sync();

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

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            testReceiverAddress,
            'testReceiverAddress',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(testReceiverAddress, buildRights([Role.AssetManager]), {
            privateKey: privateKeyDeployment
        });
        let certificate = await new Certificate.Entity('5', conf).sync();

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
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#4',
            creationTime: blockCreationTime,
            parentId: '5',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should create a new certificate (#6)', async () => {
        await assetRegistry.saveSmartMeterRead(0, 500, 'lastSmartMeterReadFileHash#5', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 4, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(4, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('6', conf).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: '6',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#5',
            creationTime: blockCreationTime,
            parentId: '6',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should fail using safeTransferFrom calldata to an address', async () => {
        const certificate = await new Certificate.Entity('6', conf).sync();

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

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            testReceiverAddress,
            'testReceiverAddress',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(testReceiverAddress, buildRights([Role.AssetManager]), {
            privateKey: privateKeyDeployment
        });
        let certificate = await new Certificate.Entity('6', conf).sync();

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
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#5',
            creationTime: blockCreationTime,
            parentId: '6',
            maxOwnerChanges: '3',
            ownerChangerCounter: '1',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('asset owner can create multiple certification requests', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const STARTING_ASSET_OWNER_BALANCE = Number(
            await TradableEntity.getBalance(accountAssetOwner, conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 100, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 200, '', 0, {
            privateKey: assetSmartmeterPK
        });

        assert.equal(
            (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1,
            LAST_SM_READ_INDEX + 2
        );

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 301, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 425, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 582, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 2, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 5, {
            privateKey: assetOwnerPK
        });

        assert.equal(
            (await certificateLogic.getCertificationRequests()).length,
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 2
        );
        assert.equal(await Certificate.getCertificateListLength(conf), STARTING_CERTIFICATE_LENGTH);
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE
        );

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 1
        );
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE + 1
        );

        await certificateLogic.approveCertificationRequest(
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 1,
            {
                privateKey: issuerPK
            }
        );

        assert.equal(
            (await certificateLogic.getCertificationRequests()).length,
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 2
        );

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 2
        );
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE + 2
        );

        const certificateOne = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        assert.equal(certificateOne.powerInW, 200);

        const certificateTwo = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(certificateTwo.powerInW, 382);
    });

    it('issuer should not be able to issue certificates twice for the same certification request', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const STARTING_ASSET_OWNER_BALANCE = Number(
            await TradableEntity.getBalance(accountAssetOwner, conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;

        await assetRegistry.saveSmartMeterRead(0, LAST_SMART_METER_READ + 100, '', 0, {
            privateKey: assetSmartmeterPK
        });

        assert.equal(await Certificate.getCertificateListLength(conf), STARTING_CERTIFICATE_LENGTH);
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 1
        );
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE + 1
        );

        try {
            await certificateLogic.approveCertificationRequest(
                INITIAL_CERTIFICATION_REQUESTS_LENGTH,
                {
                    privateKey: issuerPK
                }
            );
        } catch (e) {
            assert.include(e.message, 'certification request has to be in pending state');
        }

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 1
        );
        assert.equal(
            await TradableEntity.getBalance(accountAssetOwner, conf),
            STARTING_ASSET_OWNER_BALANCE + 1
        );
    });

    it('should create a new certificate (#10)', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;

        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + 100,
            'lastSmartMeterReadFileHash#10',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        delete certificate.configuration;
        delete certificate.proofs;

        blockCreationTime = '' + (await web3.eth.getBlock('latest')).timestamp;
        assert.deepEqual(certificate as any, {
            id: STARTING_CERTIFICATE_LENGTH.toString(),
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#10',
            creationTime: blockCreationTime,
            parentId: STARTING_CERTIFICATE_LENGTH.toString(),
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should make certificate #10 available for sale', async () => {
        let certificate = await new Certificate.Entity('10', conf).sync();

        await certificate.publishForSale(10, '0x1230000000000000000000000000000000000000', 30);

        certificate = await certificate.sync();

        assert.equal(certificate.status, Certificate.Status.Split);
        assert.isFalse(certificate.forSale);

        const childCert1 = await new Certificate.Entity('11', conf).sync();

        delete childCert1.configuration;
        delete childCert1.proofs;
        delete childCert1.creationTime;

        assert.deepEqual(childCert1 as any, {
            id: '11',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 30,
            forSale: true,
            acceptedToken: '0x1230000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '10',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#10',
            parentId: '10',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });

        const childCert2 = await new Certificate.Entity('12', conf).sync();

        delete childCert2.configuration;
        delete childCert2.proofs;
        delete childCert2.creationTime;

        assert.deepEqual(childCert2 as any, {
            id: '12',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 70,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#10',
            parentId: '10',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        });
    });

    it('should make certificate #12 available for sale with fiat', async () => {
        let certificate = await new Certificate.Entity('12', conf).sync();

        const price = 10.5;

        await certificate.publishForSale(price, Currency.EUR);

        certificate = await certificate.sync();
        delete certificate.configuration;
        delete certificate.proofs;
        delete certificate.creationTime;

        assert.deepEqual(certificate as any, {
            id: '12',
            initialized: true,
            assetId: '0',
            children: [],
            owner: accountAssetOwner,
            powerInW: 70,
            forSale: true,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: '0',
            escrow: [matcherAccount],
            approvedAddress: '0x0000000000000000000000000000000000000000',
            status: Certificate.Status.Active.toString(),
            dataLog: 'lastSmartMeterReadFileHash#10',
            parentId: '10',
            maxOwnerChanges: '3',
            ownerChangerCounter: '0',
            offChainSettlementOptions: {
                price: price * 100,
                currency: Currency.EUR
            }
        });
    });

    it('should split certificate when trying to buy just a part of it', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_POWER = 100;
        const CERTIFICATE_PRICE = 7;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        let parentCertificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        await parentCertificate.publishForSale(CERTIFICATE_PRICE, erc20TestTokenAddress);

        assert.equal(
            await erc20TestToken.balanceOf(accountAssetOwner),
            ASSET_OWNER_STARTING_TOKEN_BALANCE
        );
        assert.equal(await erc20TestToken.balanceOf(accountTrader), TRADER_STARTING_TOKEN_BALANCE);

        setActiveUser(traderPK);

        await parentCertificate.buyCertificate(CERTIFICATE_POWER / 2);

        assert.equal(
            await erc20TestToken.balanceOf(accountAssetOwner),
            ASSET_OWNER_STARTING_TOKEN_BALANCE + CERTIFICATE_PRICE
        );
        assert.equal(
            await erc20TestToken.balanceOf(accountTrader),
            TRADER_STARTING_TOKEN_BALANCE - CERTIFICATE_PRICE
        );

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.status, Certificate.Status.Split);

        const firstChildCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(firstChildCertificate.status, Certificate.Status.Active);
        assert.equal(firstChildCertificate.forSale, false);
        assert.equal(firstChildCertificate.powerInW, CERTIFICATE_POWER / 2);

        const secondChildCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 2).toString(),
            conf
        ).sync();

        assert.equal(secondChildCertificate.status, Certificate.Status.Active);
        assert.equal(secondChildCertificate.forSale, true);
        assert.equal(secondChildCertificate.powerInW, CERTIFICATE_POWER / 2);
    });

    it('should fail to split and buy and split certificate when trying to buy higher power than certificate has', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_POWER = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        let parentCertificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        await parentCertificate.publishForSale(CERTIFICATE_PRICE, Currency.EUR);

        try {
            await parentCertificate.buyCertificate(CERTIFICATE_POWER * 2);
        } catch (error) {
            assert.include(
                error.message,
                'revert Energy has to be higher than 0 and lower or equal than certificate energy'
            );
        }

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.status, Certificate.Status.Active);
        assert.equal(parentCertificate.forSale, true);
    });

    it('should buy certificate without splitting when passing energy equal to certificate energy', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_POWER = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        let parentCertificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        await parentCertificate.publishForSale(CERTIFICATE_PRICE, Currency.EUR);

        setActiveUser(traderPK);

        await parentCertificate.buyCertificate(CERTIFICATE_POWER);

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.status, Certificate.Status.Active);
        assert.equal(parentCertificate.forSale, false);
        assert.equal(parentCertificate.owner, accountTrader);
    });

    it('should correctly set off-chain currency after buying and splitting certificate', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_POWER = 100;
        const CERTIFICATE_PRICE = 7;
        const CERTIFICATE_CURRENCY = Currency.EUR;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        let parentCertificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        await parentCertificate.publishForSale(CERTIFICATE_PRICE, CERTIFICATE_CURRENCY);

        const parentOffchainSettlementOptions = await parentCertificate.getOffChainSettlementOptions();

        assert.equal(parentCertificate.onChainDirectPurchasePrice, 0);

        assert.deepEqual(parentOffchainSettlementOptions, {
            price: CERTIFICATE_PRICE * 100,
            currency: CERTIFICATE_CURRENCY
        });

        assert.equal(
            await erc20TestToken.balanceOf(accountAssetOwner),
            ASSET_OWNER_STARTING_TOKEN_BALANCE
        );
        assert.equal(await erc20TestToken.balanceOf(accountTrader), TRADER_STARTING_TOKEN_BALANCE);

        setActiveUser(traderPK);

        await parentCertificate.buyCertificate(CERTIFICATE_POWER / 2);

        assert.equal(
            await erc20TestToken.balanceOf(accountAssetOwner),
            ASSET_OWNER_STARTING_TOKEN_BALANCE
        );
        assert.equal(await erc20TestToken.balanceOf(accountTrader), TRADER_STARTING_TOKEN_BALANCE);

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.status, Certificate.Status.Split);

        const firstChildCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(firstChildCertificate.status, Certificate.Status.Active);
        assert.equal(firstChildCertificate.forSale, false);
        assert.equal(firstChildCertificate.powerInW, CERTIFICATE_POWER / 2);
        assert.equal(firstChildCertificate.onChainDirectPurchasePrice, 0);
        assert.deepEqual(
            await firstChildCertificate.getOffChainSettlementOptions(),
            parentOffchainSettlementOptions
        );

        const secondChildCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 2).toString(),
            conf
        ).sync();

        assert.equal(secondChildCertificate.status, Certificate.Status.Active);
        assert.equal(secondChildCertificate.forSale, true);
        assert.equal(secondChildCertificate.powerInW, CERTIFICATE_POWER / 2);
        assert.equal(secondChildCertificate.onChainDirectPurchasePrice, 0);
        assert.deepEqual(
            await secondChildCertificate.getOffChainSettlementOptions(),
            parentOffchainSettlementOptions
        );
    });

    it('should setup bulk buy certificates', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetRegistry.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetRegistry.getAssetGeneral(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_POWER = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );
        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });
        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        let firstCertificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        await assetRegistry.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_POWER * 2,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );
        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 2, {
            privateKey: assetOwnerPK
        });
        await certificateLogic.approveCertificationRequest(
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 1,
            {
                privateKey: issuerPK
            }
        );

        let secondCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        await firstCertificate.publishForSale(CERTIFICATE_PRICE, erc20TestTokenAddress);
        firstCertificate = await firstCertificate.sync();
        await secondCertificate.publishForSale(CERTIFICATE_PRICE, erc20TestTokenAddress);
        secondCertificate = await secondCertificate.sync();

        assert.equal(firstCertificate.owner, accountAssetOwner);
        assert.equal(secondCertificate.owner, accountAssetOwner);
    });

    it('should not be able to bulk buy own certificates', async () => {
        setActiveUser(assetOwnerPK);

        const latestCertificateId = Number(await Certificate.getCertificateListLength(conf)) - 1;
        try {
            await certificateLogic.buyCertificateBulk(
                [latestCertificateId - 1, latestCertificateId],
                {
                    privateKey: assetOwnerPK
                }
            );
        } catch (error) {
            assert.include(error.message, `Can't buy your own certificates`);
        }

        const firstCertificate = await new Certificate.Entity(
            (latestCertificateId - 1).toString(),
            conf
        ).sync();
        const secondCertificate = await new Certificate.Entity(
            latestCertificateId.toString(),
            conf
        ).sync();

        assert.equal(firstCertificate.owner, accountAssetOwner);
        assert.equal(secondCertificate.owner, accountAssetOwner);
    });

    it('should bulk buy certificates', async () => {
        setActiveUser(traderPK);

        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));

        const latestCertificateId = Number(await Certificate.getCertificateListLength(conf)) - 1;
        await certificateLogic.buyCertificateBulk([latestCertificateId - 1, latestCertificateId], {
            privateKey: traderPK
        });

        const firstCertificate = await new Certificate.Entity(
            (latestCertificateId - 1).toString(),
            conf
        ).sync();
        const secondCertificate = await new Certificate.Entity(
            latestCertificateId.toString(),
            conf
        ).sync();

        assert.equal(firstCertificate.owner, accountTrader);
        assert.equal(secondCertificate.owner, accountTrader);

        assert.isAbove(
            Number(await erc20TestToken.balanceOf(accountAssetOwner)),
            ASSET_OWNER_STARTING_TOKEN_BALANCE
        );
        assert.isBelow(
            Number(await erc20TestToken.balanceOf(accountTrader)),
            TRADER_STARTING_TOKEN_BALANCE
        );
    });
});
