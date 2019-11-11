import { assert } from 'chai';
import 'mocha';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { UserLogic, Role, buildRights } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { Asset, ProducingAsset, AssetLogic } from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { Configuration, Compliance, Currency } from '@energyweb/utils-general';
import {
    deployERC20TestToken,
    Erc20TestToken,
    TestReceiver,
    deployERC721TestReceiver
} from '@energyweb/erc-test-contracts';

import { CertificateLogic, Certificate } from '..';
import { migrateCertificateRegistryContracts } from '../utils/migrateContracts';
import { logger } from '../blockchain-facade/Logger';
import { OffChainDataClientMock } from '@energyweb/origin-backend-client';

describe('CertificateLogic-Facade', () => {
    let userLogic: UserLogic;
    let assetLogic: AssetLogic;
    let certificateLogic: CertificateLogic;

    let erc20TestToken: Erc20TestToken;
    let erc20TestTokenAddress: string;
    let testReceiver: TestReceiver;

    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const assetSmartmeterPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const approvedPK = '0x60a0dae29ff80793b6cc1602f60fbe548b6787d0f9d4eb7c0967dac8ff11591a';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    let conf: Configuration.Entity;
    let blockCreationTime: number;

    function setActiveUser(privateKey: string) {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    }

    async function generateCertificateAndGetId(energy = 100): Promise<string> {
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = Number(await certificateLogic.getCertificationRequestsLength({
            privateKey: issuerPK
        }));

        setActiveUser(assetOwnerPK);
        
        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + energy,
            '',
            0,
            {
                privateKey: assetSmartmeterPK
            }
        );
        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });
        await certificateLogic.approveCertificationRequest(
            INITIAL_CERTIFICATION_REQUESTS_LENGTH,
            {
                privateKey: issuerPK
            }
        );

        return (Number(await Certificate.getCertificateListLength(conf)) - 1).toString(); // latestCertificateId
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
        userLogic = await migrateUserRegistryContracts(web3, privateKeyDeployment);

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

        assetLogic = await migrateAssetRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );

        certificateLogic = await migrateCertificateRegistryContracts(
            web3,
            assetLogic.web3Contract.options.address,
            privateKeyDeployment
        );

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                assetLogicInstance: assetLogic,
                userLogicInstance: userLogic,
                certificateLogicInstance: certificateLogic,
                web3
            },
            offChainDataSource: {
                baseUrl: `${process.env.BACKEND_URL}/api`,
                client: new OffChainDataClientMock()
            },
            logger
        };
    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.getCertificateListLength(conf), 0);
        assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 0);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 0);
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
        const assetProps: Asset.IOnChainProperties = {
            smartMeter: { address: assetSmartmeter },
            owner: { address: accountAssetOwner },
            lastSmartMeterReadWh: 0,
            active: true,
            usageType: Asset.UsageType.Producing,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            propertiesDocumentHash: null,
            url: null
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
            timezone: 'Asia/Bangkok',
            assetType: 'Wind',
            complianceRegistry: Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: ''
        };

        assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

        await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    });

    it('should log a new meterreading ', async () => {
        await assetLogic.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', 0, {
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
        assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 1);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 0);
    });

    it('should return certificate', async () => {
        const certificate = await new Certificate.Entity('0', conf).sync();
        assert.equal(certificate.owner, accountAssetOwner);

        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;
        
        assert.deepOwnInclude(certificate, {
            id: '0',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 0,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should make certificate available for sale', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
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
            assert.include(ex.message, 'not the certificate-owner or market matcher');
        }

        assert.isTrue(failed);
    });

    it('should unpublish certificate available from sale', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

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

        certificate = await certificate.sync();

        assert.equal(await Certificate.getCertificateListLength(conf), 1);
        assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 0);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
        assert.equal(certificate.owner, accountTrader);

        assert.deepOwnInclude(certificate, {
            id: '0',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountTrader,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 0,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('create a new certificate (#1)', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        await assetLogic.saveSmartMeterRead(0, 200, 'lastSmartMeterReadFileHash', 0, {
            privateKey: assetSmartmeterPK
        });
        await certificateLogic.requestCertificates(0, 1, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(1, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('1', conf).sync();

        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;
        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should approve', async () => {
        let certificate = await new Certificate.Entity('1', conf).sync();

        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000000');

        await certificate.approve('0x0000000000000000000000000000000000000001');
        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000001');

        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should set erc20-token and price for a certificate', async () => {
        let certificate = await new Certificate.Entity('1', conf).sync();

        await certificate.publishForSale(100, erc20TestTokenAddress);
        certificate = await certificate.sync();

        assert.equal(await certificate.getOnChainDirectPurchasePrice(), 100);
        assert.equal(certificate.onChainDirectPurchasePrice, 100);
        assert.equal(await certificate.getTradableToken(), erc20TestTokenAddress);

        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: true,
            acceptedToken: erc20TestTokenAddress,
            onChainDirectPurchasePrice: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);

        await certificate.unpublishForSale();
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
            assert.include(ex.message, 'the buyer should have enough allowance to buy');
        }

        assert.isTrue(failed);
    });

    it('should buying a certificate when enough erc20 tokens are approved', async () => {
        await erc20TestToken.approve(accountAssetOwner, 100, { privateKey: traderPK });

        let certificate = await new Certificate.Entity('1', conf).sync();

        await certificate.buyCertificate();
        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountTrader,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#2)', async () => {
        await assetLogic.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash#3', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 2, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(2, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('2', conf).sync();
        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;

        assert.deepOwnInclude(certificate, {
            id: '2',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should split a certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

        let certificate = await new Certificate.Entity('2', conf).sync();

        await certificate.splitCertificate(60);

        certificate = await certificate.sync();
        
        assert.deepOwnInclude(certificate, {
            id: '2',
            initialized: true,
            assetId: 0,
            children: ['3', '4'],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Split,
            creationTime: blockCreationTime,
            parentId: 2,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);

        const c1 = await new Certificate.Entity('3', conf).sync();
        const c2 = await new Certificate.Entity('4', conf).sync();

        assert.deepOwnInclude(c1, {
            id: '3',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 60,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);

        assert.deepOwnInclude(c2, {
            id: '4',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 40,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);

        const activeCerts = await Certificate.getActiveCertificates(conf);
        const activeIndices = activeCerts.map(cert => cert.id);

        assert.equal(activeIndices.indexOf(certificate.id), -1);
        assert.notEqual(activeIndices.indexOf(c1.id), -1);
        assert.notEqual(activeIndices.indexOf(c2.id), -1);
    });

    it('should retire a certificate', async () => {
        let certificate = await new Certificate.Entity('3', conf).sync();

        await certificate.claim();

        certificate = await certificate.sync();

        assert.isTrue(await certificate.isClaimed());
        assert.equal(certificate.owner, accountAssetOwner);

        assert.deepOwnInclude(certificate, {
            id: '3',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 60,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Claimed,
            creationTime: blockCreationTime,
            parentId: 2,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#5)', async () => {
        await assetLogic.saveSmartMeterRead(0, 400, 'lastSmartMeterReadFileHash#4', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 3, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(3, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('5', conf).sync();

        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;
        assert.deepOwnInclude(certificate, {
            id: '5',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 5,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
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

        assert.deepOwnInclude(certificate, {
            id: '5',
            initialized: true,
            assetId: 0,
            children: [],
            owner: testReceiverAddress,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 5,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#6)', async () => {
        await assetLogic.saveSmartMeterRead(0, 500, 'lastSmartMeterReadFileHash#5', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, 4, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.approveCertificationRequest(4, {
            privateKey: issuerPK
        });

        const certificate = await new Certificate.Entity('6', conf).sync();

        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;
        assert.deepOwnInclude(certificate, {
            id: '6',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 6,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
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

        assert.deepOwnInclude(certificate, {
            id: '6',
            initialized: true,
            assetId: 0,
            children: [],
            owner: testReceiverAddress,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 6,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('asset owner can create multiple certification requests', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const STARTING_ASSET_OWNER_BALANCE = Number(
            await certificateLogic.balanceOf(accountAssetOwner)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = Number(await certificateLogic.getCertificationRequestsLength({
            privateKey: issuerPK
        }));

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 100, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 200, '', 0, {
            privateKey: assetSmartmeterPK
        });

        assert.equal(
            (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1,
            LAST_SM_READ_INDEX + 2
        );

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 301, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 425, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 582, '', 0, {
            privateKey: assetSmartmeterPK
        });

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 2, {
            privateKey: assetOwnerPK
        });

        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 5, {
            privateKey: assetOwnerPK
        });

        assert.equal(
            await certificateLogic.getCertificationRequestsLength({
                privateKey: issuerPK
            }),
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 2
        );
        assert.equal(await Certificate.getCertificateListLength(conf), STARTING_CERTIFICATE_LENGTH);
        assert.equal(
            await certificateLogic.balanceOf(accountAssetOwner),
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
            await certificateLogic.balanceOf(accountAssetOwner),
            STARTING_ASSET_OWNER_BALANCE + 1
        );

        await certificateLogic.approveCertificationRequest(
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 1,
            {
                privateKey: issuerPK
            }
        );

        assert.equal(
            await certificateLogic.getCertificationRequestsLength({
                privateKey: issuerPK
            }),
            INITIAL_CERTIFICATION_REQUESTS_LENGTH + 2
        );

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 2
        );
        assert.equal(
            await certificateLogic.balanceOf(accountAssetOwner),
            STARTING_ASSET_OWNER_BALANCE + 2
        );

        const certificateOne = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        assert.equal(certificateOne.energy, 200);

        const certificateTwo = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(certificateTwo.energy, 382);
    });

    it('issuer should not be able to issue certificates twice for the same certification request', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const STARTING_ASSET_OWNER_BALANCE = Number(
            await certificateLogic.balanceOf(accountAssetOwner)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = Number(await certificateLogic.getCertificationRequestsLength({
            privateKey: issuerPK
        }));

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + 100, '', 0, {
            privateKey: assetSmartmeterPK
        });

        assert.equal(await Certificate.getCertificateListLength(conf), STARTING_CERTIFICATE_LENGTH);
        assert.equal(
            await certificateLogic.balanceOf(accountAssetOwner),
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
            await certificateLogic.balanceOf(accountAssetOwner),
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
            assert.include(e.message, 'approveCertificationRequest: request has to be in pending state');
        }

        assert.equal(
            await Certificate.getCertificateListLength(conf),
            STARTING_CERTIFICATE_LENGTH + 1
        );
        assert.equal(
            await certificateLogic.balanceOf(accountAssetOwner),
            STARTING_ASSET_OWNER_BALANCE + 1
        );
    });

    it('should create a new certificate (#10)', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = Number(await certificateLogic.getCertificationRequestsLength({
            privateKey: issuerPK
        }));

        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };

        await assetLogic.saveSmartMeterRead(
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

        blockCreationTime = (await web3.eth.getBlock('latest')).timestamp;
        assert.deepOwnInclude(certificate, {
            id: STARTING_CERTIFICATE_LENGTH.toString(),
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 100,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: STARTING_CERTIFICATE_LENGTH,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should make certificate #10 available for sale', async () => {
        let certificate = await new Certificate.Entity('10', conf).sync();

        await certificate.publishForSale(10, '0x1230000000000000000000000000000000000000', 30);

        certificate = await certificate.sync();

        assert.equal(certificate.status, Certificate.Status.Split);
        assert.isFalse(certificate.forSale);

        const childCert1 = await new Certificate.Entity('11', conf).sync();

        assert.deepOwnInclude(childCert1, {
            id: '11',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 30,
            forSale: true,
            acceptedToken: '0x1230000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 10,
            status: Certificate.Status.Active,
            parentId: 10,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);

        const childCert2 = await new Certificate.Entity('12', conf).sync();

        assert.deepOwnInclude(childCert2, {
            id: '12',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 70,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            parentId: 10,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should make certificate #12 available for sale with fiat', async () => {
        let certificate = await new Certificate.Entity('12', conf).sync();

        const price = 10.5;

        await certificate.publishForSale(price, Currency.EUR);

        certificate = await certificate.sync();
 
        assert.deepOwnInclude(certificate, {
            id: '12',
            initialized: true,
            assetId: 0,
            children: [],
            owner: accountAssetOwner,
            energy: 70,
            forSale: true,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            status: Certificate.Status.Active,
            parentId: 10,
            offChainSettlementOptions: {
                price: price * 100,
                currency: Currency.EUR
            }
        } as Partial<Certificate.Entity>);
    });

    it('should split certificate when trying to buy just a part of it', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY,
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

        await parentCertificate.buyCertificate(CERTIFICATE_ENERGY / 2);

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
        assert.equal(firstChildCertificate.energy, CERTIFICATE_ENERGY / 2);

        const secondChildCertificate = await new Certificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 2).toString(),
            conf
        ).sync();

        assert.equal(secondChildCertificate.status, Certificate.Status.Active);
        assert.equal(secondChildCertificate.forSale, true);
        assert.equal(secondChildCertificate.energy, CERTIFICATE_ENERGY / 2);
    });

    it('should fail to split and buy and split certificate when trying to buy higher ENERGY than certificate has', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY,
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
            await parentCertificate.buyCertificate(CERTIFICATE_ENERGY * 2);
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
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY,
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

        await parentCertificate.buyCertificate(CERTIFICATE_ENERGY);

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.status, Certificate.Status.Active);
        assert.equal(parentCertificate.forSale, false);
        assert.equal(parentCertificate.owner, accountTrader);
    });

    it('should correctly set off-chain currency after buying and splitting certificate', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;
        const CERTIFICATE_CURRENCY = Currency.EUR;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY,
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

        await parentCertificate.buyCertificate(CERTIFICATE_ENERGY / 2);

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
        assert.equal(firstChildCertificate.energy, CERTIFICATE_ENERGY / 2);
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
        assert.equal(secondChildCertificate.energy, CERTIFICATE_ENERGY / 2);
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
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number(
            (await assetLogic.getAsset(0)).lastSmartMeterReadWh
        );
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = (await certificateLogic.getCertificationRequests())
            .length;
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY,
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

        await assetLogic.saveSmartMeterRead(
            0,
            LAST_SMART_METER_READ + CERTIFICATE_ENERGY * 2,
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

    it('should bulk claim certificates', async () => {
        setActiveUser(assetOwnerPK);

        const certificatesToClaim = [
            await generateCertificateAndGetId(),
            await generateCertificateAndGetId()
        ];

        for (const certificateId of certificatesToClaim) {
            const certificate = await new Certificate.Entity(
                certificateId,
                conf
            ).sync();

            assert.equal(certificate.status, Certificate.Status.Active);
        }
        
        await certificateLogic.claimCertificateBulk(certificatesToClaim.map(cId => parseInt(cId, 10)), {
            privateKey: assetOwnerPK
        });

        for (const certificateId of certificatesToClaim) {
            const certificate = await new Certificate.Entity(
                certificateId,
                conf
            ).sync();

            assert.equal(certificate.status, Certificate.Status.Claimed);
        }
    });

    it('should return asset registry address', async () => {
        const assetLogicAddress = await certificateLogic.assetLogicAddress();

        assert.equal(assetLogicAddress, assetLogic.web3Contract.options.address);
    });
});
