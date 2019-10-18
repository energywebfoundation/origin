import { assert } from 'chai';
import Web3 from 'web3';
import moment from 'moment';
import dotenv from 'dotenv';

import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';
import { AssetProducingRegistryLogic, ProducingAsset } from '@energyweb/asset-registry';
import { Agreement, Demand, MarketLogic, Supply } from '@energyweb/market';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { buildRights, Role, UserLogic } from '@energyweb/user-registry';
import { Compliance, Configuration, Currency, TimeFrame, Unit } from '@energyweb/utils-general';

import { startMatcher, IMatcherConfig } from '..';
import { logger } from '../Logger';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForConditionAndAssert(
    conditionCheckFunction: () => Promise<boolean> | boolean,
    assertFunction: () => Promise<void> | void,
    interval: number,
    timeout: number
): Promise<void> {
    let timePassed = 0;

    while (timePassed < timeout) {
        if (await conditionCheckFunction()) {
            await assertFunction();

            return;
        }

        await sleep(interval);
        timePassed += interval;
    }

    await assertFunction();
}

describe('Test StrategyBasedMatcher', async () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

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
    let smartMeterRead = 0;

    const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartMeterPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const assetSmartMeter = web3.eth.accounts.privateKeyToAccount(assetSmartMeterPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    const matcherConfig: IMatcherConfig = {
        web3Url: process.env.WEB3,
        offChainDataSourceUrl: `${process.env.BACKEND_URL}/api`,
        marketContractLookupAddress: '',
        matcherAccount: {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        }
    };

    describe('Setup', () => {
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
        });

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
        });

        it('should deploy market-registry contracts', async () => {
            const deployedContracts = await migrateMarketRegistryContracts(
                web3 as any,
                assetContractLookupAddr,
                originContractLookupAddr,
                privateKeyDeployment
            );

            const marketLogicAddress: string = (deployedContracts as any).MarketLogic;

            marketLogic = new MarketLogic(web3, marketLogicAddress);
            marketContractLookupAddr = (deployedContracts as any).MarketContractLookup;

            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                marketLogicAddress,
                'matcher',
                { privateKey: privateKeyDeployment }
            );

            await userLogic.setRoles(marketLogicAddress, buildRights([Role.Matcher]), {
                privateKey: privateKeyDeployment
            });

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
                    baseUrl: `${process.env.BACKEND_URL}/api`
                },
                logger
            };

            const demandOffChainProps: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.hourly,
                maxPricePerMwh: 150,
                currency: Currency.USD,
                location: ['Thailand;Central;Nakhon Pathom'],
                assetType: ['Solar'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                typeOfPublicSupport: 'string',
                energyPerTimeFrame: 1 * Unit.MWh,
                registryCompliance: Compliance.EEC,
                startTime: moment().unix(),
                endTime: moment()
                    .add(1, 'hour')
                    .unix()
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
                propertiesDocumentHash: null,
                url: null,
                maxOwnerChanges: 3
            };

            const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
                facilityName: 'MatcherTestFacility',
                operationalSince: 0,
                capacityWh: 10,
                country: 'Thailand',
                address:
                    '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                gpsLatitude: '14.059500',
                gpsLongitude: '99.977800',
                timezone: 'Asia/Bangkok',
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
        });
    });

    describe('Certificate -> Demand matching tests', () => {
        it('creates a smart meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };
            const energy = 1 * Unit.MWh;
            smartMeterRead += energy;

            const producingAsset = await new ProducingAsset.Entity(asset.id, conf).sync();
            await producingAsset.saveSmartMeterRead(smartMeterRead, 'newMeterRead');

            await certificateLogic.requestCertificates(0, 0, {
                privateKey: assetOwnerPK
            });

            await certificateLogic.approveCertificationRequest(0, {
                privateKey: issuerPK
            });
        });

        it('certificate has been created', async () => {
            assert.equal(await Certificate.getCertificateListLength(conf), 1);

            const certificate = await new Certificate.Entity('0', conf).sync();
            assert.equal(certificate.owner, assetOwnerAddress);
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
            conf.blockchainProperties.activeUser = {
                address: accountDeployment,
                privateKey: privateKeyDeployment
            };

            await waitForConditionAndAssert(
                async () => {
                    const certificate = await new Certificate.Entity('0', conf).sync();

                    return certificate.owner === accountTrader;
                },
                async () => {
                    const certificate = await new Certificate.Entity('0', conf).sync();
                    assert.equal(certificate.owner, accountTrader);
                },
                1000,
                20000
            );
        });
    });

    describe('Agreement -> Certificate matching tests', () => {
        it('should create an agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const startTime = moment().unix();

            const agreementOffChainProps: Agreement.IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + startTime,
                price: 150,
                currency: Currency.USD,
                period: 10,
                timeFrame: TimeFrame.hourly
            };

            const agreementProps: Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                demandId: '0',
                supplyId: '0'
            };

            await Agreement.createAgreement(agreementProps, agreementOffChainProps, conf);

            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            const agreement: Agreement.Entity = await new Agreement.Entity('0', conf).sync();
            await agreement.approveAgreementSupply();
        });

        it('creates a smart meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };

            const energy = 1.5 * Unit.MWh;
            smartMeterRead += energy;

            console.log(`smartMeterRead=${smartMeterRead}`);

            const producingAsset = await new ProducingAsset.Entity(asset.id, conf).sync();
            await producingAsset.saveSmartMeterRead(smartMeterRead, 'newMeterRead2');

            await certificateLogic.requestCertificates(0, 1, {
                privateKey: assetOwnerPK
            });

            await certificateLogic.approveCertificationRequest(1, {
                privateKey: issuerPK
            });
        });

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
        });

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

    describe('Demand -> Certificate matching tests', () => {
        let certificateId = '';
        const energy = 1 * Unit.MWh;

        it('archives previous demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const demand = new Demand.Entity('0', conf);
            await demand.changeStatus(Demand.DemandStatus.ARCHIVED);
        });

        it('creates a smart meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };

            smartMeterRead += energy;
            console.log(`smartMeterRead=${smartMeterRead}`);

            const producingAsset = new ProducingAsset.Entity(asset.id, conf);
            await producingAsset.saveSmartMeterRead(smartMeterRead, 'newMeterRead3');

            const reads = await producingAsset.getSmartMeterReads();
            const index = reads.length - 1;

            await certificateLogic.requestCertificates(Number(asset.id), index, {
                privateKey: assetOwnerPK
            });

            const requestIndex = (await certificateLogic.getCertificationRequests()).length - 1;

            await certificateLogic.approveCertificationRequest(requestIndex, {
                privateKey: issuerPK
            });

            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            certificateId = ((await Certificate.getCertificateListLength(conf)) - 1).toString();

            const certificate = await new Certificate.Entity(certificateId, conf).sync();

            await certificate.publishForSale(1, Currency.USD);

            assert.equal(certificate.energy, energy);
        });

        it('should create a demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const demandOffChainProps: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.hourly,
                maxPricePerMwh: 150,
                currency: Currency.USD,
                location: ['Thailand;Central;Nakhon Pathom'],
                assetType: ['Solar'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                typeOfPublicSupport: 'string',
                energyPerTimeFrame: energy,
                registryCompliance: Compliance.EEC,
                startTime: moment().unix(),
                endTime: moment()
                    .add(1, 'hour')
                    .unix()
            };

            await Demand.createDemand(demandOffChainProps, conf);
            assert.equal(await Demand.getDemandListLength(conf), 2);
        });

        it('demand should be matched with existing certificate', async () => {
            const demand = await new Demand.Entity('1', conf).sync();

            await waitForConditionAndAssert(
                async () => {
                    const certificate = await new Certificate.Entity(certificateId, conf).sync();

                    return certificate.owner === demand.demandOwner;
                },
                async () => {
                    const certificate = await new Certificate.Entity(certificateId, conf).sync();

                    assert.equal(certificate.owner, demand.demandOwner);
                },
                1000,
                20000
            );
        });
    });
});
