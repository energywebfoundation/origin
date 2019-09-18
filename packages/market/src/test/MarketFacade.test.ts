import 'mocha';

import {
    AssetProducingRegistryLogic,
    migrateAssetRegistryContracts,
    ProducingAsset
} from '@energyweb/asset-registry';
import {
    buildRights,
    migrateUserRegistryContracts,
    Role,
    UserLogic
} from '@energyweb/user-registry';
import * as GeneralLib from '@energyweb/utils-general';
import { assert } from 'chai';
import * as fs from 'fs';
import Web3 from 'web3';

import * as Market from '..';
import {
    IAgreementOffChainProperties,
    IMatcherOffChainProperties
} from '../blockchain-facade/Agreement';
import { logger } from '../Logger';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';

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
    let marketLogic: Market.MarketLogic;

    let userContractLookupAddr;
    let assetContractLookupAddr;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const matcher = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const traderPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

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

    it('should deploy market-registry contracts', async () => {
        const deployedContracts = await migrateMarketRegistryContracts(
            web3 as any,
            assetContractLookupAddr,
            privateKeyDeployment
        );
        marketLogic = new Market.MarketLogic(web3 as any, (deployedContracts as any).MarketLogic);
    });

    describe('Demand-Facade', () => {
        const START_TIME = '1559466472732';
        const END_TIME = '1559466492732';

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
                    web3
                },
                offChainDataSource: {
                    baseUrl: 'http://localhost:3030'
                },
                logger
            };

            const demandOffChainProps: Market.Demand.IDemandOffChainProperties = {
                timeFrame: GeneralLib.TimeFrame.hourly,
                maxPricePerMwh: 1.5,
                currency: GeneralLib.Currency.USD,
                location: { provinces: ['string'], regions: ['string'] },
                assetType: ['Solar'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                typeOfPublicSupport: 'string',
                targetWhPerPeriod: 10,
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
                url: `http://localhost:3030/Demand/${marketLogic.web3Contract._address}`,
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
                url: `http://localhost:3030/Demand/${marketLogic.web3Contract._address}`,
                demandOwner: accountTrader,
                status: 0
            } as Partial<Market.Demand.Entity>);

            assert.deepEqual(demand.offChainProperties, {
                assetType: ['Solar'],
                currency: GeneralLib.Currency.USD,
                location: { provinces: ['string'], regions: ['string'] },
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                maxPricePerMwh: 1.5,
                registryCompliance: 2,
                targetWhPerPeriod: 10,
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
    });

    describe('Supply-Facade', () => {
        it('should onboard an asset', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountDeployment,
                privateKey: privateKeyDeployment
            };

            const assetProps: ProducingAsset.IOnChainProperties = {
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
                matcher: [{ address: matcher }],
                propertiesDocumentHash: null,
                url: null,
                maxOwnerChanges: 3
            };

            const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
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
                assetType: 'Wind',
                complianceRegistry: GeneralLib.Compliance.EEC,
                otherGreenAttributes: '',
                typeOfPublicSupport: '',
                facilityName: ''
            };

            assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

            await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
        });

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
        let startTime;
        it('should create an agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            startTime = Date.now();

            const agreementOffchainProps: IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + 1000,
                price: 10,
                currency: GeneralLib.Currency.USD,
                period: 10,
                timeFrame: GeneralLib.TimeFrame.hourly
            };

            const matcherOffchainProps: IMatcherOffChainProperties = {
                currentWh: 0,
                currentPeriod: 0
            };

            const agreementProps: Market.Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                matcherDBURL: null,
                matcherPropertiesDocumentHash: null,
                demandId: '0',
                supplyId: '0',
                allowedMatcher: []
            };

            const agreement = await Market.Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                matcherOffchainProps,
                conf
            );

            assert.equal(await Market.Agreement.getAgreementListLength(conf), 1);

            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 0
                },
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
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 0
                },
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
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '0',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 0
                },
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

            startTime = Date.now();

            const agreementOffchainProps: IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + 1000,
                price: 10,
                currency: GeneralLib.Currency.USD,
                period: 10,
                timeFrame: GeneralLib.TimeFrame.hourly
            };

            const matcherOffchainProps: IMatcherOffChainProperties = {
                currentWh: 0,
                currentPeriod: 0
            };

            const agreementProps: Market.Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                matcherDBURL: null,
                matcherPropertiesDocumentHash: null,
                demandId: '0',
                supplyId: '0',
                allowedMatcher: []
            };

            const agreement = await Market.Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                matcherOffchainProps,
                conf
            );

            assert.equal(await Market.Agreement.getAgreementListLength(conf), 2);

            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '1',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: false,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 0
                },
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
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '1',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 0
                },
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

        it('should change matcherProperties', async () => {
            conf.blockchainProperties.activeUser = {
                address: matcher,
                privateKey: matcherPK
            };

            let agreement: Market.Agreement.Entity = await new Market.Agreement.Entity(
                '1',
                conf
            ).sync();

            const matcherOffchainProps: IMatcherOffChainProperties = {
                currentWh: 100,
                currentPeriod: 0
            };

            await agreement.setMatcherProperties(matcherOffchainProps);

            agreement = await agreement.sync();
            delete agreement.proofs;
            delete agreement.configuration;
            delete agreement.propertiesDocumentHash;
            delete agreement.matcherPropertiesDocumentHash;

            assert.deepEqual(agreement, {
                allowedMatcher: [matcher],
                id: '1',
                initialized: true,
                url: 'http://localhost:3030/Agreement',
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                matcherDBURL: 'http://localhost:3030/Matcher',
                matcherOffChainProperties: {
                    currentPeriod: 0,
                    currentWh: 100
                },
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
