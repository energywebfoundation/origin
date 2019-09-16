import {
    AssetProducingRegistryLogic,
    migrateAssetRegistryContracts,
    ProducingAsset
} from '@energyweb/asset-registry';
import {
    Agreement,
    Demand,
    MarketLogic,
    migrateMarketRegistryContracts,
    Supply
} from '@energyweb/market';
import {
    Certificate,
    CertificateLogic,
    migrateCertificateRegistryContracts
} from '@energyweb/origin';
import {
    buildRights,
    migrateUserRegistryContracts,
    Role,
    UserLogic
} from '@energyweb/user-registry';
import { Compliance, Configuration, Currency, TimeFrame } from '@energyweb/utils-general';
import { assert } from 'chai';
import Web3 from 'web3';

import { startMatcher, IMatcherConfig } from '..';
import { logger } from '../Logger';

const PROVIDER_URL = 'http://localhost:8545';
const BACKEND_URL = 'http://localhost:3030';
const deployKey = 'd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

describe('Test StrategyBasedMatcher', async () => {
    const web3 = new Web3(PROVIDER_URL);

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    console.log(`acc-deployment: ${accountDeployment}`);
    let conf: Configuration.Entity;
    let userLogic: UserLogic;
    let assetProducingRegistry: AssetProducingRegistryLogic;
    let marketLogic: MarketLogic;
    let certificateLogic: CertificateLogic;

    let userContractLookupAddr: string;
    let assetContractLookupAddr: string;
    let originContractLookupAddr: string;
    let marketContractLookupAddr: string;

    let asset: ProducingAsset.Entity;

    const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartMeterPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const assetSmartMeter = web3.eth.accounts.privateKeyToAccount(assetSmartMeterPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    const matcherConfig: IMatcherConfig = {
        web3Url: PROVIDER_URL,
        offChainDataSourceUrl: BACKEND_URL,
        marketContractLookupAddress: '',
        originContractLookupAddress: '',
        matcherAccount: {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        }
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    it('should deploy user-registry contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);
        userContractLookupAddr = (userContracts as any).UserContractLookup;

        userLogic = new UserLogic(web3, (userContracts as any).UserLogic);
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            accountDeployment,
            buildRights([
                Role.UserAdmin,
                Role.AssetAdmin,
                Role.AssetManager,
                Role.Trader,
                Role.Matcher
            ]),
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

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            assetOwnerAddress,
            'assetOwner',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(assetOwnerAddress, buildRights([Role.AssetManager]), {
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
    }).timeout(5000);

    it('should deploy asset-registry contracts', async () => {
        const deployedContracts = await migrateAssetRegistryContracts(
            web3 as any,
            userContractLookupAddr,
            privateKeyDeployment
        );
        assetProducingRegistry = new AssetProducingRegistryLogic(
            web3 as any,
            (deployedContracts as any).AssetProducingRegistryLogic
        );
        assetContractLookupAddr = (deployedContracts as any).AssetContractLookup;
    });

    it('should deploy origin (issuer) contracts', async () => {
        const deployedContracts = await migrateCertificateRegistryContracts(
            web3 as any,
            assetContractLookupAddr,
            privateKeyDeployment
        );
        certificateLogic = new CertificateLogic(
            web3 as any,
            (deployedContracts as any).CertificateLogic
        );
        originContractLookupAddr = (deployedContracts as any).OriginContractLookup;

        matcherConfig.originContractLookupAddress = originContractLookupAddr;
    });

    it('should deploy market-registry contracts', async () => {
        const deployedContracts = await migrateMarketRegistryContracts(
            web3 as any,
            assetContractLookupAddr,
            originContractLookupAddr,
            privateKeyDeployment
        );
        marketLogic = new MarketLogic(web3, (deployedContracts as any).MarketLogic);
        marketContractLookupAddr = (deployedContracts as any).MarketContractLookup;

        matcherConfig.marketContractLookupAddress = marketContractLookupAddr;
    });

    it('should create a demand', async () => {
        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountTrader,
                    privateKey: traderPK
                },
                userLogicInstance: userLogic,
                producingAssetLogicInstance: assetProducingRegistry,
                marketLogicInstance: marketLogic,
                certificateLogicInstance: certificateLogic,
                web3
            },
            offChainDataSource: {
                baseUrl: BACKEND_URL
            },
            logger
        };

        const demandOffChainProps: Demand.IDemandOffChainProperties = {
            timeFrame: TimeFrame.hourly,
            maxPricePerMwh: 150,
            currency: Currency.USD,
            producingAsset: '0',
            consumingAsset: '0',
            location: { provinces: ['string'], regions: ['string'] },
            assetType: ['Solar'],
            minCO2Offset: 10,
            otherGreenAttributes: 'string',
            typeOfPublicSupport: 'string',
            targetWhPerPeriod: 1e6,
            registryCompliance: Compliance.EEC,
            startTime: '1559466472732',
            endTime: '1559466492732'
        };

        await Demand.createDemand(demandOffChainProps, conf);
        assert.equal(await Demand.getDemandListLength(conf), 1);
    });

    it('should onboard an asset', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        };

        const assetProps: ProducingAsset.IOnChainProperties = {
            smartMeter: { address: assetSmartMeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            matcher: [{ address: accountDeployment }],
            propertiesDocumentHash: null,
            url: null,
            maxOwnerChanges: 3
        };

        const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
            facilityName: 'MatcherTestFacility',
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
            assetType: 'Solar',
            complianceRegistry: Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: ''
        };

        asset = await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
        assert.equal(await ProducingAsset.getAssetListLength(conf), 1);
    });

    it('should onboard an supply', async () => {
        conf.blockchainProperties.activeUser = {
            address: assetOwnerAddress,
            privateKey: assetOwnerPK
        };

        await Supply.createSupply(
            {
                url: null,
                propertiesDocumentHash: null,
                assetId: '0'
            },
            {
                price: 150,
                currency: Currency.USD,
                availableWh: 1e6,
                timeFrame: TimeFrame.hourly
            },
            conf
        );

        assert.equal(await Supply.getSupplyListLength(conf), 1);
    });

    it('no certificate has been created', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountTrader,
            privateKey: traderPK
        };
        assert.equal(await Certificate.getCertificateListLength(conf), 0);
    });

    it('starts the matcher', async () => {
        await startMatcher(matcherConfig);

        await sleep(5000);
    }).timeout(6000);

    it('sets the market lookup contract', async () => {
        conf.blockchainProperties.activeUser = {
            address: assetOwnerAddress,
            privateKey: assetOwnerPK
        };

        try {
            await conf.blockchainProperties.producingAssetLogicInstance.setMarketLookupContract(
                asset.id,
                originContractLookupAddr,
                { privateKey: assetOwnerPK }
            );
            conf.logger.info(`Certificates for Asset #${asset.id} initialized`);
        } catch (e) {
            conf.logger.error(`Could not initialize certificates\n${e}`);
        }
    });

    describe('Demand matching tests', () => {
        it('creates a smart meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };

            const producingAsset = await new ProducingAsset.Entity(asset.id, conf).sync();
            await producingAsset.saveSmartMeterRead(1e6, 'newMeterRead');

            await certificateLogic.requestCertificates(0, 0, {
                privateKey: assetOwnerPK
            });

            await certificateLogic.approveCertificationRequest(0, {
                privateKey: issuerPK
            });
        }).timeout(10000);

        it('certificate has been created', async () => {
            assert.equal(await Certificate.getCertificateListLength(conf), 1);
        });

        it('certificate has been published for sale', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            let certificate = await new Certificate.Entity('0', conf).sync();

            await certificate.publishForSale(1, Currency.USD);
            certificate = await certificate.sync();

            assert.isTrue(certificate.forSale);
            assert.equal(await Certificate.getCertificateListLength(conf), 1);
        });

        it('certificate owner is the trader after successful match', async () => {
            console.log({
                marketLogic
            });
            const events = await marketLogic.getEvents('DemandFilled');
            console.log({ events });
            assert.equal(events.length, 0);

            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            await sleep(10000);

            const certificate = await new Certificate.Entity('0', conf).sync();
            assert.equal(await certificate.getOwner(), accountTrader);
        }).timeout(11000);
    });

    describe('Agreement matching tests', () => {
        it('should create an agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const startTime = Math.floor(Date.now() / 1000);

            const agreementOffchainProps: Agreement.IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + startTime,
                price: 150,
                currency: Currency.USD,
                period: 10,
                timeframe: TimeFrame.hourly
            };

            const matcherOffchainProps: Agreement.IMatcherOffChainProperties = {
                currentWh: 0,
                currentPeriod: 0
            };

            const agreementProps: Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                matcherDBURL: null,
                matcherPropertiesDocumentHash: null,
                demandId: '0',
                supplyId: '0',
                allowedMatcher: []
            };

            await Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                matcherOffchainProps,
                conf
            );

            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            const agreement: Agreement.Entity = await new Agreement.Entity('0', conf).sync();
            await agreement.approveAgreementSupply();
        }).timeout(6000);

        it('creates a smart meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };

            const producingAsset = await new ProducingAsset.Entity(asset.id, conf).sync();
            await producingAsset.saveSmartMeterRead(2.5e6, 'newMeterRead2');

            await certificateLogic.requestCertificates(0, 1, {
                privateKey: assetOwnerPK
            });

            await certificateLogic.approveCertificationRequest(1, {
                privateKey: issuerPK
            });
        }).timeout(10000);

        it('certificate has been created', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };
            assert.equal(await Certificate.getCertificateListLength(conf), 2);
        });

        it('certificate is not for sale', async () => {
            const certificate = await new Certificate.Entity('1', conf).sync();

            assert.isFalse(certificate.forSale);
        });

        it('a certificate has been split', async () => {
            await sleep(10000);

            assert.equal(await Certificate.getCertificateListLength(conf), 4);
        }).timeout(11000);

        it('asset owner is still the owner of the original certificate', async () => {
            const certificate = await new Certificate.Entity('1', conf).sync();
            assert.equal(await certificate.getOwner(), assetOwnerAddress);
        });

        it('trader is owner of the split certificates', async () => {
            const certificate1 = await new Certificate.Entity('2', conf).sync();
            assert.equal(await certificate1.getOwner(), accountTrader);

            const certificate2 = await new Certificate.Entity('3', conf).sync();
            assert.equal(await certificate2.getOwner(), assetOwnerAddress);
        });
    });
});
