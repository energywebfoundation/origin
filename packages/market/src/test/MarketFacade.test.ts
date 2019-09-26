import 'mocha';

import { AssetProducingRegistryLogic, ProducingAsset } from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { buildRights, Role, UserLogic } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import * as GeneralLib from '@energyweb/utils-general';
import { assert } from 'chai';
import * as fs from 'fs';
import Web3 from 'web3';

import moment from 'moment';
import * as Market from '..';
import { IAgreementOffChainProperties } from '../blockchain-facade/Agreement';
import { logger } from '../Logger';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { MarketLogic } from '../wrappedContracts/MarketLogic';

describe('Market-Facade', () => {
    const configFile = JSON.parse(
        fs.readFileSync(`${process.cwd()}/connection-config.json`, 'utf8')
    );

    const web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : `0x${configFile.develop.deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    console.log(`acc-deployment: ${accountDeployment}`);
    let conf: GeneralLib.Configuration.Entity;
    let userLogic: UserLogic;
    let assetProducingRegistry: AssetProducingRegistryLogic;
    let marketLogic: MarketLogic;
    let certificateLogic: CertificateLogic;

    let userContractLookupAddr: string;
    let assetContractLookupAddr: string;
    let originContractLookupAddr: string;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartMeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartMeter = web3.eth.accounts.privateKeyToAccount(assetSmartMeterPK).address;

    const matcherPK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    it('should deploy user-registry contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);
        userContractLookupAddr = (userContracts as any).UserContractLookup;

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

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            matcherAccount,
            'matcher',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(matcherAccount, buildRights([Role.Matcher]), {
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

    it('should deploy origin contracts', async () => {
        const deployedContracts = await migrateCertificateRegistryContracts(
            web3 as any,
            assetContractLookupAddr,
            privateKeyDeployment
        );
        originContractLookupAddr = (deployedContracts as any).OriginContractLookup;
        certificateLogic = new CertificateLogic(
            web3 as any,
            (deployedContracts as any).CertificateLogic
        );
    });

    it('should deploy market-registry contracts', async () => {
        const deployedContracts = await migrateMarketRegistryContracts(
            web3 as any,
            assetContractLookupAddr,
            originContractLookupAddr,
            privateKeyDeployment
        );
        const marketLogicAddress = (deployedContracts as any).MarketLogic;
        console.log({ marketLogicAddress });
        marketLogic = new MarketLogic(web3 as any, marketLogicAddress);

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            marketLogicAddress,
            'marketLogic',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(marketLogicAddress, buildRights([Role.Matcher]), {
            privateKey: privateKeyDeployment
        });
    });

    it('should init the config', () => {
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
                baseUrl: 'http://localhost:3030'
            },
            logger
        };
    });

    it('should onboard a producing asset', async () => {
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
            operationalSince: 0,
            capacityWh: 10,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '0.0123123',
            gpsLongitude: '31.1231',
            assetType: 'Wind',
            complianceRegistry: GeneralLib.Compliance.EEC,
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            facilityName: ''
        };

        assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

        await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    });

    describe('Demand-Facade', () => {
        const START_TIME = moment().unix();
        const END_TIME = moment()
            .add(1, 'hour')
            .unix();

        it('should create a demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const demandOffChainProps: Market.Demand.IDemandOffChainProperties = {
                timeFrame: GeneralLib.TimeFrame.hourly,
                maxPricePerMwh: 1.5,
                currency: GeneralLib.Currency.USD,
                location: ['Thailand;Central;Nakhon Pathom'],
                assetType: ['Solar'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                typeOfPublicSupport: 'string',
                energyPerTimeFrame: 10,
                registryCompliance: GeneralLib.Compliance.EEC,
                startTime: START_TIME,
                endTime: END_TIME
            };

            assert.equal(await Market.Demand.getDemandListLength(conf), 0);

            const demand = await Market.Demand.createDemand(demandOffChainProps, conf);

            assert.equal(await Market.Demand.getDemandListLength(conf), 1);

            assert.ownInclude(demand, {
                id: '0',
                initialized: true,
                url: `http://localhost:3030/Demand/${marketLogic.web3Contract.options.address}`,
                demandOwner: accountTrader,
                status: 0
            } as Partial<Market.Demand.Entity>);

            assert.deepEqual(demand.offChainProperties, demandOffChainProps);
        });

        it('should return 1 demand for getAllDemands', async () => {
            const allDemands = await Market.Demand.getAllDemands(conf);
            assert.equal(allDemands.length, 1);
        });

        it('should return demand', async () => {
            const demand = await new Market.Demand.Entity('0', conf).sync();

            assert.ownInclude(demand, {
                id: '0',
                initialized: true,
                url: `http://localhost:3030/Demand/${marketLogic.web3Contract.options.address}`,
                demandOwner: accountTrader,
                status: 0
            } as Partial<Market.Demand.Entity>);

            assert.deepEqual(demand.offChainProperties, {
                assetType: ['Solar'],
                currency: GeneralLib.Currency.USD,
                location: ['Thailand;Central;Nakhon Pathom'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                maxPricePerMwh: 1.5,
                registryCompliance: 2,
                energyPerTimeFrame: 10,
                timeFrame: GeneralLib.TimeFrame.hourly,
                typeOfPublicSupport: 'string',
                startTime: START_TIME,
                endTime: END_TIME
            });
        });

        it('should clone demand', async () => {
            const demand = await new Market.Demand.Entity('0', conf).sync();
            const clone = await demand.clone();

            assert.notEqual(clone.id, demand.id);
            assert.notEqual(clone.propertiesDocumentHash, demand.propertiesDocumentHash);

            assert.equal(clone.url, demand.url);
            assert.deepEqual(clone.offChainProperties, demand.offChainProperties);
        });

        it('should update off chain properties', async () => {
            const demand = await new Market.Demand.Entity('0', conf).clone();

            const offChainProperties = { ...demand.offChainProperties };
            offChainProperties.procureFromSingleFacility = !demand.offChainProperties
                .procureFromSingleFacility;
            offChainProperties.assetType = ['Hydro-electric Head', 'Mixed pumped storage head'];

            const updated = await demand.update(offChainProperties);

            assert.equal(updated.id, demand.id);
            assert.equal(updated.status, demand.status);
            assert.notEqual(updated.propertiesDocumentHash, demand.propertiesDocumentHash);
            assert.notDeepEqual(updated.offChainProperties, demand.offChainProperties);
        });

        it('should trigger DemandPartiallyFilled event after demand filled', async () => {
            const producingAsset = await new ProducingAsset.Entity('0', conf).sync();

            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter,
                privateKey: assetSmartMeterPK
            };

            await producingAsset.saveSmartMeterRead(1e6, 'newMeterRead');

            await certificateLogic.requestCertificates(0, 0, {
                privateKey: assetOwnerPK
            });

            await certificateLogic.approveCertificationRequest(0, {
                privateKey: issuerPK
            });

            conf.blockchainProperties.activeUser = {
                address: matcherAccount,
                privateKey: matcherPK
            };

            const demand = await new Market.Demand.Entity('0', conf).sync();
            let certificate = await new Certificate.Entity('0', conf).sync();
            const fillTx = await demand.fill(certificate.id);

            const demandPartiallyFilledEvents = await marketLogic.getEvents(
                'DemandPartiallyFilled',
                {
                    fromBlock: fillTx.blockNumber,
                    toBlock: fillTx.blockNumber
                }
            );

            assert.equal(demandPartiallyFilledEvents.length, 1);

            certificate = await certificate.sync();
            assert.equal(await certificate.getOwner(), demand.demandOwner);
        });
    });

    describe('Supply-Facade', () => {
        it('should onboard an supply', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            const supplyOffChainProperties: Market.Supply.ISupplyOffChainProperties = {
                price: 10,
                currency: GeneralLib.Currency.USD,
                availableWh: 10,
                timeFrame: GeneralLib.TimeFrame.hourly
            };

            const supplyProps: Market.Supply.ISupplyOnChainProperties = {
                url: null,
                propertiesDocumentHash: null,
                assetId: '0'
            };

            assert.equal(await Market.Supply.getSupplyListLength(conf), 0);

            const supply = await Market.Supply.createSupply(
                supplyProps,
                supplyOffChainProperties,
                conf
            );

            assert.equal(await Market.Supply.getSupplyListLength(conf), 1);
            delete supply.proofs;
            delete supply.configuration;
            delete supply.propertiesDocumentHash;

            assert.deepEqual(supply, {
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Supply',
                assetId: '0',
                offChainProperties: {
                    availableWh: 10,
                    currency: GeneralLib.Currency.USD,
                    price: 10,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Supply.Entity>);
        });

        it('should return supply', async () => {
            const supply: Market.Supply.Entity = await new Market.Supply.Entity('0', conf).sync();

            delete supply.proofs;
            delete supply.configuration;
            delete supply.propertiesDocumentHash;

            assert.deepEqual(supply, {
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Supply',
                assetId: '0',
                offChainProperties: {
                    availableWh: 10,
                    currency: GeneralLib.Currency.USD,
                    price: 10,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Supply.Entity>);
        });

        it('should get all supplies', async () => {
            const allSupplies = await Market.Supply.getAllSupplies(conf);
            assert.equal(allSupplies.length, 1);
        });
    });

    describe('Agreement-Facade', () => {
        let startTime: number;

        it('should create an agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            startTime = moment().unix();

            const agreementOffchainProps: IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + 1000,
                price: 10,
                currency: GeneralLib.Currency.USD,
                period: 10,
                timeFrame: GeneralLib.TimeFrame.hourly
            };

            const agreementProps: Market.Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                demandId: '0',
                supplyId: '0'
            };

            const agreement = await Market.Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                conf
            );

            assert.equal(await Market.Agreement.getAgreementListLength(conf), 1);

            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;

            assert.deepEqual(agreement, {
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: GeneralLib.Currency.USD,
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Agreement.Entity>);
        });

        it('should return an agreement', async () => {
            const agreement: Market.Agreement.Entity = await new Market.Agreement.Entity(
                '0',
                conf
            ).sync();

            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;

            assert.deepEqual(agreement, {
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: GeneralLib.Currency.USD,
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Agreement.Entity>);
        });

        it('should agree to an agreement as supply', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            let agreement: Market.Agreement.Entity = await new Market.Agreement.Entity(
                '0',
                conf
            ).sync();

            await agreement.approveAgreementSupply();

            agreement = await agreement.sync();
            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;

            assert.deepEqual(agreement, {
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: GeneralLib.Currency.USD,
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Agreement.Entity>);
        });

        it('should create a 2nd agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            startTime = moment().unix();

            const agreementOffchainProps: IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + 1000,
                price: 10,
                currency: GeneralLib.Currency.USD,
                period: 10,
                timeFrame: GeneralLib.TimeFrame.hourly
            };

            const agreementProps: Market.Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                demandId: '0',
                supplyId: '0'
            };

            const agreement = await Market.Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                conf
            );

            assert.equal(await Market.Agreement.getAgreementListLength(conf), 2);

            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;

            assert.deepEqual(agreement, {
                id: '1',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: false,
                offChainProperties: {
                    currency: GeneralLib.Currency.USD,
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Agreement.Entity>);
        });

        it('should agree to an agreement as demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            let agreement: Market.Agreement.Entity = await new Market.Agreement.Entity(
                '1',
                conf
            ).sync();

            await agreement.approveAgreementDemand();

            agreement = await agreement.sync();
            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;

            assert.deepEqual(agreement, {
                id: '1',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: GeneralLib.Currency.USD,
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: GeneralLib.TimeFrame.hourly
                }
            } as Partial<Market.Agreement.Entity>);
        });

        it('should get all agreements', async () => {
            const allAgreements = await Market.Agreement.getAllAgreements(conf);

            assert.equal(allAgreements.length, 2);
            assert.equal(allAgreements.length, await Market.Agreement.getAgreementListLength(conf));
        });

        it('should delete a demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const amountOfDemands = await Market.Demand.getDemandListLength(conf);

            const deleted = await Market.Demand.deleteDemand('0', conf);
            assert.isTrue(deleted);

            // Should remain the same
            assert.equal(await Market.Demand.getDemandListLength(conf), amountOfDemands);
        });
    });
});
