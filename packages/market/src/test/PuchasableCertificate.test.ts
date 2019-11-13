import { assert } from 'chai';
import 'mocha';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { UserLogic, Role, buildRights } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { Asset, ProducingAsset, AssetLogic } from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { Configuration, Compliance, Currency } from '@energyweb/utils-general';
import { deployERC20TestToken, Erc20TestToken } from '@energyweb/erc-test-contracts';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { OffChainDataClientMock } from '@energyweb/origin-backend-client';

import { PurchasableCertificate, MarketLogic } from '..';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { logger } from '../Logger';

describe('PurchasableCertificate-Facade', () => {
    let userLogic: UserLogic;
    let assetLogic: AssetLogic;
    let certificateLogic: CertificateLogic;
    let marketLogic: MarketLogic;

    let erc20TestToken: Erc20TestToken;
    let erc20TestTokenAddress: string;

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

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    let conf: Configuration.Entity;

    function setActiveUser(privateKey: string) {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    }

    async function generateCertificateAndGetId(energy = 100): Promise<string> {
        const LAST_SM_READ_INDEX = (await assetLogic.getSmartMeterReadsForAsset(0)).length - 1;
        const LAST_SMART_METER_READ = Number((await assetLogic.getAsset(0)).lastSmartMeterReadWh);
        const INITIAL_CERTIFICATION_REQUESTS_LENGTH = Number(
            await certificateLogic.getCertificationRequestsLength({
                privateKey: issuerPK
            })
        );

        setActiveUser(assetOwnerPK);

        await assetLogic.saveSmartMeterRead(0, LAST_SMART_METER_READ + energy, '', 0, {
            privateKey: assetSmartmeterPK
        });
        await certificateLogic.requestCertificates(0, LAST_SM_READ_INDEX + 1, {
            privateKey: assetOwnerPK
        });
        await certificateLogic.approveCertificationRequest(INITIAL_CERTIFICATION_REQUESTS_LENGTH, {
            privateKey: issuerPK
        });

        return (Number(await Certificate.getCertificateListLength(conf)) - 1).toString(); // latestCertificateId
    }

    it('should set ERC20 token', async () => {
        erc20TestTokenAddress = (
            await deployERC20TestToken(web3, accountTrader, privateKeyDeployment)
        ).contractAddress;

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

        marketLogic = await migrateMarketRegistryContracts(
            web3,
            certificateLogic.web3Contract.options.address,
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
                marketLogicInstance: marketLogic,
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

    it('should return certificate', async () => {
        const newCertificateId = await generateCertificateAndGetId();
        const pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();
        assert.equal(pCert.certificate.owner, accountAssetOwner);

        assert.deepOwnInclude(pCert, {
            id: newCertificateId,
            initialized: true,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<PurchasableCertificate.Entity>);
    });

    it('should make certificate available for sale', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountAssetOwner,
            privateKey: assetOwnerPK
        };
        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.publishForSale(10, '0x1230000000000000000000000000000000000000');

        pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();
        assert.isTrue(pCert.forSale);
    });

    it('should fail unpublish certificate from sale if not the owner', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };
        const newCertificateId = await generateCertificateAndGetId();
        const pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        let failed = false;

        try {
            await pCert.unpublishForSale();
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

        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.unpublishForSale();

        pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();
        assert.isFalse(pCert.forSale);
    });

    it('should set erc20-token and price for a certificate', async () => {
        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.publishForSale(100, erc20TestTokenAddress);
        pCert = await pCert.sync();

        assert.equal(await pCert.getOnChainDirectPurchasePrice(), 100);
        assert.equal(pCert.onChainDirectPurchasePrice, 100);
        assert.equal(await pCert.getTradableToken(), erc20TestTokenAddress);

        assert.deepOwnInclude(pCert, {
            id: newCertificateId,
            initialized: true,
            forSale: true,
            acceptedToken: erc20TestTokenAddress,
            onChainDirectPurchasePrice: 100,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<PurchasableCertificate.Entity>);

        await pCert.unpublishForSale();
    });

    it('should fail buying a certificate when not for sale', async () => {
        setActiveUser(traderPK);

        const newCertificateId = await generateCertificateAndGetId();
        const pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        let failed = false;

        try {
            await pCert.buyCertificate();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'Unable to buy a certificate that is not for sale');
        }

        assert.isTrue(failed);
    });

    it('should make certificate 1 available for sale', async () => {
        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.publishForSale(10, erc20TestTokenAddress);

        pCert = await pCert.sync();

        assert.isTrue(pCert.forSale);
    });

    it('should fail buying a certificate when not enough erc20 tokens approved', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };

        const newCertificateId = await generateCertificateAndGetId();
        const pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        let failed = false;

        try {
            await pCert.buyCertificate();
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'the buyer should have enough allowance to buy');
        }

        assert.isTrue(failed);
    });

    it('should buy a certificate when enough erc20 tokens are approved', async () => {
        await erc20TestToken.approve(accountAssetOwner, 100, { privateKey: traderPK });

        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.buyCertificate();
        pCert = await pCert.sync();

        assert.deepOwnInclude(pCert, {
            id: newCertificateId,
            initialized: true,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            onChainDirectPurchasePrice: 0,
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<Certificate.Entity>);
    });

    it('should make certificate available for sale', async () => {
        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        await pCert.publishForSale(10, '0x1230000000000000000000000000000000000000', 30);

        pCert = await pCert.sync();

        assert.equal(pCert.certificate.status, Certificate.Status.Split);
        assert.isFalse(pCert.forSale);

        const childCert1 = await new PurchasableCertificate.Entity(
            newCertificateId + 1,
            conf
        ).sync();

        assert.deepOwnInclude(childCert1, {
            id: '11',
            initialized: true,
            forSale: true,
            acceptedToken: '0x1230000000000000000000000000000000000000',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<PurchasableCertificate.Entity>);

        const childCert2 = await new PurchasableCertificate.Entity(
            newCertificateId + 2,
            conf
        ).sync();

        assert.deepOwnInclude(childCert2, {
            id: '12',
            initialized: true,
            forSale: false,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            offChainSettlementOptions: {
                price: 0,
                currency: Currency.NONE
            }
        } as Partial<PurchasableCertificate.Entity>);
    });

    it('should make certificate available for sale with fiat', async () => {
        const newCertificateId = await generateCertificateAndGetId();
        let pCert = await new PurchasableCertificate.Entity(newCertificateId, conf).sync();

        const price = 10.5;

        await pCert.publishForSale(price, Currency.EUR);

        pCert = await pCert.sync();

        assert.deepOwnInclude(pCert, {
            id: '12',
            initialized: true,
            forSale: true,
            acceptedToken: '0x0000000000000000000000000000000000000000',
            offChainSettlementOptions: {
                price: price * 100,
                currency: Currency.EUR
            }
        } as Partial<PurchasableCertificate.Entity>);
    });

    it('should split certificate when trying to buy just a part of it', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let parentCertificate = await new PurchasableCertificate.Entity(
            newCertificateId,
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

        assert.equal(parentCertificate.certificate.status, Certificate.Status.Split);

        const firstChildCertificate = await new PurchasableCertificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(firstChildCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(firstChildCertificate.forSale, false);
        assert.equal(firstChildCertificate.certificate.energy, CERTIFICATE_ENERGY / 2);

        const secondChildCertificate = await new PurchasableCertificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 2).toString(),
            conf
        ).sync();

        assert.equal(secondChildCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(secondChildCertificate.forSale, true);
        assert.equal(secondChildCertificate.certificate.energy, CERTIFICATE_ENERGY / 2);
    });

    it('should fail to split and buy and split certificate when trying to buy higher ENERGY than certificate has', async () => {
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let parentCertificate = await new PurchasableCertificate.Entity(
            newCertificateId,
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

        assert.equal(parentCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(parentCertificate.forSale, true);
    });

    it('should buy certificate without splitting when passing energy equal to certificate energy', async () => {
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let parentCertificate = await new PurchasableCertificate.Entity(
            newCertificateId,
            conf
        ).sync();

        await parentCertificate.publishForSale(CERTIFICATE_PRICE, Currency.EUR);

        setActiveUser(traderPK);

        await parentCertificate.buyCertificate(CERTIFICATE_ENERGY);

        parentCertificate = await parentCertificate.sync();

        assert.equal(parentCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(parentCertificate.forSale, false);
        assert.equal(parentCertificate.certificate.owner, accountTrader);
    });

    it('should correctly set off-chain currency after buying and splitting certificate', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );
        const CERTIFICATE_ENERGY = 100;
        const CERTIFICATE_PRICE = 7;
        const CERTIFICATE_CURRENCY = Currency.EUR;
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));
        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );

        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let parentCertificate = await new PurchasableCertificate.Entity(
            newCertificateId,
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

        assert.equal(parentCertificate.certificate.status, Certificate.Status.Split);

        const firstChildCertificate = await new PurchasableCertificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 1).toString(),
            conf
        ).sync();

        assert.equal(firstChildCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(firstChildCertificate.certificate.energy, CERTIFICATE_ENERGY / 2);
        assert.equal(firstChildCertificate.forSale, false);
        assert.equal(firstChildCertificate.onChainDirectPurchasePrice, 0);
        assert.deepEqual(
            await firstChildCertificate.getOffChainSettlementOptions(),
            parentOffchainSettlementOptions
        );

        const secondChildCertificate = await new PurchasableCertificate.Entity(
            (STARTING_CERTIFICATE_LENGTH + 2).toString(),
            conf
        ).sync();

        assert.equal(secondChildCertificate.certificate.status, Certificate.Status.Active);
        assert.equal(secondChildCertificate.certificate.energy, CERTIFICATE_ENERGY / 2);
        assert.equal(secondChildCertificate.forSale, true);
        assert.equal(secondChildCertificate.onChainDirectPurchasePrice, 0);

        assert.deepEqual(
            await secondChildCertificate.getOffChainSettlementOptions(),
            parentOffchainSettlementOptions
        );
    });

    it('should setup bulk buy certificates', async () => {
        const CERTIFICATE_PRICE = 7;

        setActiveUser(assetOwnerPK);

        const newCertificateId = await generateCertificateAndGetId();
        let firstCertificate = await new PurchasableCertificate.Entity(
            newCertificateId,
            conf
        ).sync();

        const newCertificateId2 = await generateCertificateAndGetId();
        let secondCertificate = await new PurchasableCertificate.Entity(
            newCertificateId2,
            conf
        ).sync();

        await firstCertificate.publishForSale(CERTIFICATE_PRICE, erc20TestTokenAddress);
        firstCertificate = await firstCertificate.sync();
        await secondCertificate.publishForSale(CERTIFICATE_PRICE, erc20TestTokenAddress);
        secondCertificate = await secondCertificate.sync();

        assert.equal(firstCertificate.certificate.owner, accountAssetOwner);
        assert.equal(secondCertificate.certificate.owner, accountAssetOwner);
    });

    it('should not be able to bulk buy own certificates', async () => {
        setActiveUser(assetOwnerPK);

        const newCertificateId = parseInt(await generateCertificateAndGetId(), 10);
        const newCertificateId2 = parseInt(await generateCertificateAndGetId(), 10);

        try {
            await marketLogic.buyCertificateBulk([newCertificateId, newCertificateId2], {
                privateKey: assetOwnerPK
            });
        } catch (error) {
            assert.include(error.message, `Can't buy your own certificates`);
        }

        const firstCertificate = await new PurchasableCertificate.Entity(
            newCertificateId.toString(),
            conf
        ).sync();
        const secondCertificate = await new PurchasableCertificate.Entity(
            newCertificateId2.toString(),
            conf
        ).sync();

        assert.equal(firstCertificate.certificate.owner, accountAssetOwner);
        assert.equal(secondCertificate.certificate.owner, accountAssetOwner);
    });

    it('should bulk buy certificates', async () => {
        setActiveUser(traderPK);

        const ASSET_OWNER_STARTING_TOKEN_BALANCE = Number(
            await erc20TestToken.balanceOf(accountAssetOwner)
        );
        const TRADER_STARTING_TOKEN_BALANCE = Number(await erc20TestToken.balanceOf(accountTrader));

        const newCertificateId = parseInt(await generateCertificateAndGetId(), 10);
        const newCertificateId2 = parseInt(await generateCertificateAndGetId(), 10);

        await marketLogic.buyCertificateBulk([newCertificateId, newCertificateId2], {
            privateKey: traderPK
        });

        const firstCertificate = await new PurchasableCertificate.Entity(
            newCertificateId.toString(),
            conf
        ).sync();
        const secondCertificate = await new PurchasableCertificate.Entity(
            newCertificateId2.toString(),
            conf
        ).sync();

        assert.equal(firstCertificate.certificate.owner, accountTrader);
        assert.equal(secondCertificate.certificate.owner, accountTrader);

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
