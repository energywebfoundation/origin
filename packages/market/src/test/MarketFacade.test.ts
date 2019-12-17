import 'mocha';
import { assert } from 'chai';
import Web3 from 'web3';
import dotenv from 'dotenv';
import moment from 'moment';

import {
    DeviceLogic,
    Device,
    ProducingDevice,
    Contracts as DeviceRegistryContracts
} from '@energyweb/device-registry';
import {
    buildRights,
    Role,
    UserLogic,
    Contracts as UserRegistryContracts
} from '@energyweb/user-registry';
import { CertificateLogic, Contracts as OriginContracts } from '@energyweb/origin';
import { Configuration, TimeFrame } from '@energyweb/utils-general';
import { OffChainDataClientMock } from '@energyweb/origin-backend-client';

import { deployERC20TestToken } from '../utils/deployERC20TestToken';
import { Erc20TestToken } from '../wrappedContracts/Erc20TestToken';
import { IAgreementOffChainProperties } from '../blockchain-facade/Agreement';
import { logger } from '../Logger';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { PurchasableCertificate, MarketLogic, Demand, Supply, Agreement, MarketUser } from '..';

describe('Market-Facade', () => {
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
    let deviceLogic: DeviceLogic;
    let certificateLogic: CertificateLogic;
    let marketLogic: MarketLogic;

    let erc20TestToken: Erc20TestToken;
    let erc20TestTokenAddress: string;

    const deviceOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const deviceOwnerAddress = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const deviceSmartMeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const deviceSmartMeter = web3.eth.accounts.privateKeyToAccount(deviceSmartMeterPK).address;

    const matcherPK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    it('should set ERC20 token', async () => {
        erc20TestTokenAddress = await deployERC20TestToken(
            web3,
            accountTrader,
            privateKeyDeployment
        );

        erc20TestToken = new Erc20TestToken(web3, erc20TestTokenAddress);
    });

    it('should deploy user-registry contracts', async () => {
        userLogic = await UserRegistryContracts.migrateUserRegistryContracts(
            web3,
            privateKeyDeployment
        );
        assert.exists(userLogic);
    });

    it('should deploy device-registry contracts', async () => {
        deviceLogic = await DeviceRegistryContracts.migrateDeviceRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );
        assert.exists(deviceLogic);
    });

    it('should deploy origin contracts', async () => {
        certificateLogic = await OriginContracts.migrateCertificateRegistryContracts(
            web3,
            deviceLogic.web3Contract.options.address,
            privateKeyDeployment
        );
        assert.exists(certificateLogic);
    });

    it('should deploy market-registry contracts', async () => {
        marketLogic = await migrateMarketRegistryContracts(
            web3 as any,
            certificateLogic.web3Contract.options.address,
            privateKeyDeployment
        );
        assert.exists(marketLogic);
    });

    it('should init the config', () => {
        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                userLogicInstance: userLogic,
                deviceLogicInstance: deviceLogic,
                marketLogicInstance: marketLogic,
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

    it('should create all the users', async () => {
        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: accountDeployment,
                active: true,
                roles: buildRights([
                    Role.UserAdmin,
                    Role.DeviceAdmin,
                    Role.DeviceManager,
                    Role.Trader,
                    Role.Matcher
                ]),
                organization: 'Admin'
            },
            {
                firstName: 'Admin',
                surname: 'Admin',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: accountTrader,
                active: true,
                roles: buildRights([Role.Trader]),
                organization: 'trader'
            },
            {
                firstName: 'trader',
                surname: 'trader',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: deviceOwnerAddress,
                active: true,
                roles: buildRights([Role.DeviceManager]),
                organization: 'deviceOwner'
            },
            {
                firstName: 'deviceOwner',
                surname: 'deviceOwner',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: issuerAccount,
                active: true,
                roles: buildRights([Role.Issuer]),
                organization: 'issuer'
            },
            {
                firstName: 'issuer',
                surname: 'issuer',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: matcherAccount,
                active: true,
                roles: buildRights([Role.Matcher]),
                organization: 'matcher'
            },
            {
                firstName: 'matcher',
                surname: 'matcher',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: marketLogic.web3Contract.options.address,
                active: true,
                roles: buildRights([Role.Matcher]),
                organization: 'marketLogic'
            },
            {
                firstName: 'marketLogic',
                surname: 'marketLogic',
                email: '',
                street: '',
                number: '',
                zip: '',
                city: '',
                country: '',
                state: ''
            },
            conf
        );
    });

    it('should update MarketUser off-chain properties', async () => {
        const newEmail = 'testemail@example.com';

        let user = await new MarketUser.Entity(accountDeployment, conf).sync();
        await user.update({
            firstName: 'Admin',
            surname: 'Admin',
            email: newEmail,
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: ''
        });

        user = await user.sync();

        assert.equal(user.offChainProperties.email, newEmail);
    });

    it('should not update user properties when blockchain tx fails', async () => {
        const newEmail = 'testemail@example.com';

        conf.blockchainProperties.userLogicInstance.updateUser = async (
            id: string,
            hash: string,
            url: string,
            tx: any
        ) => {
            throw new Error(`Intentional Error: ${id}, ${hash}, ${url}, ${tx}`);
        };

        let user = await new MarketUser.Entity(accountDeployment, conf).sync();

        const oldUserProperties = user.offChainProperties;

        const newOffChainProperties = { ...oldUserProperties };
        newOffChainProperties.email = newEmail;

        let failed = false;

        try {
            await user.update(newOffChainProperties);
        } catch (e) {
            assert.isTrue(e.message.includes('Intentional Error'));
            failed = true;
        }

        assert.isTrue(failed);

        user = await user.sync();

        assert.deepEqual(user.offChainProperties, oldUserProperties);
    });

    it('should onboard a producing device', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        };

        const deviceProps: Device.IOnChainProperties = {
            smartMeter: { address: deviceSmartMeter },
            owner: { address: deviceOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            usageType: Device.UsageType.Producing,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            propertiesDocumentHash: null,
            url: null
        };

        const devicePropsOffChain: ProducingDevice.IOffChainProperties = {
            operationalSince: 0,
            capacityWh: 10,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '0.0123123',
            gpsLongitude: '31.1231',
            timezone: 'Asia/Bangkok',
            deviceType: 'Wind',
            complianceRegistry: 'I-REC',
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            facilityName: ''
        };

        assert.equal(await ProducingDevice.getDeviceListLength(conf), 0);

        await ProducingDevice.createDevice(deviceProps, devicePropsOffChain, conf);
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

            const demandOffChainProps: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.hourly,
                maxPricePerMwh: 1.5,
                currency: 'USD',
                location: ['Thailand;Central;Nakhon Pathom'],
                deviceType: ['Solar'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                typeOfPublicSupport: 'string',
                energyPerTimeFrame: 10,
                registryCompliance: 'I-REC',
                startTime: START_TIME,
                endTime: END_TIME,
                automaticMatching: true
            };

            assert.equal(await Demand.getDemandListLength(conf), 0);

            const demand = await Demand.createDemand(demandOffChainProps, conf);

            assert.equal(await Demand.getDemandListLength(conf), 1);

            assert.ownInclude(demand, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${demand.propertiesDocumentHash}`,
                demandOwner: accountTrader,
                status: 0
            } as Partial<Demand.Entity>);

            assert.deepEqual(demand.offChainProperties, demandOffChainProps);
        });

        it('should return 1 demand for getAllDemands', async () => {
            const allDemands = await Demand.getAllDemands(conf);
            assert.equal(allDemands.length, 1);
        });

        it('should return demand', async () => {
            const demand = await new Demand.Entity('0', conf).sync();

            assert.ownInclude(demand, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${demand.propertiesDocumentHash}`,
                demandOwner: accountTrader,
                status: 0
            } as Partial<Demand.Entity>);

            assert.deepOwnInclude(demand.offChainProperties, {
                deviceType: ['Solar'],
                currency: 'USD',
                location: ['Thailand;Central;Nakhon Pathom'],
                minCO2Offset: 10,
                otherGreenAttributes: 'string',
                maxPricePerMwh: 1.5,
                registryCompliance: 'I-REC',
                energyPerTimeFrame: 10,
                timeFrame: TimeFrame.hourly,
                typeOfPublicSupport: 'string',
                startTime: START_TIME,
                endTime: END_TIME
            });
        });

        it('should clone demand', async () => {
            const demand = await new Demand.Entity('0', conf).sync();
            const clone = await demand.clone();

            assert.notEqual(clone.id, demand.id);
            assert.notEqual(clone.propertiesDocumentHash, demand.propertiesDocumentHash);
            assert.notEqual(clone.url, demand.url);

            assert.deepEqual(clone.offChainProperties, demand.offChainProperties);
        });

        it('should update demand off chain properties', async () => {
            const demand = await new Demand.Entity('0', conf).clone();

            const oldPropertiesHash = demand.propertiesDocumentHash;
            const oldOffChainProperties = demand.offChainProperties;

            const offChainProperties = { ...demand.offChainProperties };
            offChainProperties.procureFromSingleFacility = !demand.offChainProperties
                .procureFromSingleFacility;
            offChainProperties.deviceType = ['Hydro-electric Head', 'Mixed pumped storage head'];

            const updated = await demand.update(offChainProperties);

            assert.equal(updated.id, demand.id);
            assert.equal(updated.status, demand.status);
            assert.notEqual(updated.propertiesDocumentHash, oldPropertiesHash);
            assert.notDeepEqual(updated.offChainProperties, oldOffChainProperties);
        });

        it('should not update demand properties when blockchain tx fails', async () => {
            conf.blockchainProperties.marketLogicInstance.updateDemand = async (
                id: string,
                hash: string,
                url: string,
                tx: any
            ) => {
                throw new Error(`Intentional Error: ${id}, ${hash}, ${url}, ${tx}`);
            };

            let demand = await new Demand.Entity('0', conf).sync();

            const oldDemandProperties = demand.offChainProperties;

            const newOffChainProperties = { ...oldDemandProperties };
            newOffChainProperties.deviceType = ['Hydro-electric Head', 'Mixed pumped storage head'];

            let failed = false;

            try {
                await demand.update(newOffChainProperties);
            } catch (e) {
                assert.isTrue(e.message.includes('Intentional Error'));
                failed = true;
            }

            assert.isTrue(failed);

            demand = await demand.sync();

            assert.deepEqual(demand.offChainProperties, oldDemandProperties);
        });

        it('should trigger DemandPartiallyFilled event after agreement demand filled', async () => {
            const producingDevice = await new ProducingDevice.Entity('0', conf).sync();

            conf.blockchainProperties.activeUser = {
                address: deviceSmartMeter,
                privateKey: deviceSmartMeterPK
            };

            await producingDevice.saveSmartMeterRead(1e6, 'newMeterRead');

            await certificateLogic.requestCertificates(0, 0, {
                privateKey: deviceOwnerPK
            });

            await certificateLogic.approveCertificationRequest(0, {
                privateKey: issuerPK
            });

            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            let certificate = await new PurchasableCertificate.Entity('0', conf).sync();

            await erc20TestToken.approve(deviceOwnerAddress, 2, { privateKey: traderPK });

            conf.blockchainProperties.activeUser = {
                address: matcherAccount,
                privateKey: matcherPK
            };
            const demand = await new Demand.Entity('0', conf).sync();

            const fillTx = await demand.fillAgreement(certificate.id);

            const demandPartiallyFilledEvents = await marketLogic.getEvents(
                'DemandPartiallyFilled',
                {
                    fromBlock: fillTx.blockNumber,
                    toBlock: fillTx.blockNumber
                }
            );

            assert.equal(demandPartiallyFilledEvents.length, 1);

            certificate = await certificate.sync();
            assert.equal(certificate.certificate.owner, demand.demandOwner);
        });

        it('should trigger DemandPartiallyFilled event after demand filled', async () => {
            const producingDevice = await new ProducingDevice.Entity('0', conf).sync();

            conf.blockchainProperties.activeUser = {
                address: deviceSmartMeter,
                privateKey: deviceSmartMeterPK
            };

            await producingDevice.saveSmartMeterRead(2e6, 'newMeterRead');

            await certificateLogic.requestCertificates(0, 1, {
                privateKey: deviceOwnerPK
            });

            await certificateLogic.approveCertificationRequest(1, {
                privateKey: issuerPK
            });

            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            const certificate = await new PurchasableCertificate.Entity('1', conf).sync();

            await certificate.publishForSale(1000, 'USD');

            conf.blockchainProperties.activeUser = {
                address: matcherAccount,
                privateKey: matcherPK
            };

            const demand = await new Demand.Entity('0', conf).sync();
            const fillTx = await demand.fill(certificate.id);

            const demandPartiallyFilledEvents = await marketLogic.getEvents(
                'DemandPartiallyFilled',
                {
                    fromBlock: fillTx.blockNumber,
                    toBlock: fillTx.blockNumber
                }
            );

            assert.equal(demandPartiallyFilledEvents.length, 1);

            const filledCertificate = await certificate.sync();
            assert.equal(filledCertificate.certificate.owner, demand.demandOwner);
        });
    });

    describe('Supply-Facade', () => {
        it('should onboard an supply', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            const supplyOffChainProperties: Supply.ISupplyOffChainProperties = {
                price: 10,
                currency: 'USD',
                availableWh: 10,
                timeFrame: TimeFrame.hourly
            };

            const supplyProps: Supply.ISupplyOnChainProperties = {
                url: null,
                propertiesDocumentHash: null,
                deviceId: '0'
            };

            assert.equal(await Supply.getSupplyListLength(conf), 0);

            const supply = await Supply.createSupply(supplyProps, supplyOffChainProperties, conf);

            assert.equal(await Supply.getSupplyListLength(conf), 1);

            assert.deepOwnInclude(supply, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${supply.propertiesDocumentHash}`,
                deviceId: '0',
                offChainProperties: {
                    availableWh: 10,
                    currency: 'USD',
                    price: 10,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Supply.Entity>);
        });

        it('should return supply', async () => {
            const supply: Supply.Entity = await new Supply.Entity('0', conf).sync();

            assert.deepOwnInclude(supply, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${supply.propertiesDocumentHash}`,
                deviceId: '0',
                offChainProperties: {
                    availableWh: 10,
                    currency: 'USD',
                    price: 10,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Supply.Entity>);
        });

        it('should get all supplies', async () => {
            const allSupplies = await Supply.getAllSupplies(conf);
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
                currency: 'USD',
                period: 10,
                timeFrame: TimeFrame.hourly
            };

            const agreementProps: Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                demandId: '0',
                supplyId: '0'
            };

            const agreement = await Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                conf
            );

            assert.equal(await Agreement.getAgreementListLength(conf), 1);

            delete agreement.proofs;
            delete agreement.configuration;

            assert.deepOwnInclude(agreement, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${agreement.propertiesDocumentHash}`,
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: 'USD',
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Agreement.Entity>);
        });

        it('should return an agreement', async () => {
            const agreement: Agreement.Entity = await new Agreement.Entity('0', conf).sync();

            delete agreement.proofs;
            delete agreement.configuration;

            assert.deepOwnInclude(agreement, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${agreement.propertiesDocumentHash}`,
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: false,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: 'USD',
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Agreement.Entity>);
        });

        it('should agree to an agreement as supply', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            let agreement: Agreement.Entity = await new Agreement.Entity('0', conf).sync();

            await agreement.approveAgreementSupply();

            agreement = await agreement.sync();

            assert.deepOwnInclude(agreement, {
                id: '0',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${agreement.propertiesDocumentHash}`,
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: 'USD',
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Agreement.Entity>);
        });

        it('should create a 2nd agreement', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            startTime = moment().unix();

            const agreementOffchainProps: IAgreementOffChainProperties = {
                start: startTime,
                end: startTime + 1000,
                price: 10,
                currency: 'USD',
                period: 10,
                timeFrame: TimeFrame.hourly
            };

            const agreementProps: Agreement.IAgreementOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                demandId: '0',
                supplyId: '0'
            };

            const agreement = await Agreement.createAgreement(
                agreementProps,
                agreementOffchainProps,
                conf
            );

            assert.equal(await Agreement.getAgreementListLength(conf), 2);

            assert.deepOwnInclude(agreement, {
                id: '1',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${agreement.propertiesDocumentHash}`,
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: false,
                offChainProperties: {
                    currency: 'USD',
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Agreement.Entity>);
        });

        it('should agree to an agreement as demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            let agreement: Agreement.Entity = await new Agreement.Entity('1', conf).sync();

            await agreement.approveAgreementDemand();

            agreement = await agreement.sync();

            assert.deepOwnInclude(agreement, {
                id: '1',
                initialized: true,
                url: `${process.env.BACKEND_URL}/api/Entity/${agreement.propertiesDocumentHash}`,
                demandId: '0',
                supplyId: '0',
                approvedBySupplyOwner: true,
                approvedByDemandOwner: true,
                offChainProperties: {
                    currency: 'USD',
                    end: startTime + 1000,
                    period: 10,
                    price: 10,
                    start: startTime,
                    timeFrame: TimeFrame.hourly
                }
            } as Partial<Agreement.Entity>);
        });

        it('should get all agreements', async () => {
            const allAgreements = await Agreement.getAllAgreements(conf);

            assert.equal(allAgreements.length, 2);
            assert.equal(allAgreements.length, await Agreement.getAgreementListLength(conf));
        });

        it('should delete a demand', async () => {
            conf.blockchainProperties.activeUser = {
                address: accountTrader,
                privateKey: traderPK
            };

            const amountOfDemands = await Demand.getDemandListLength(conf);

            const deleted = await Demand.deleteDemand('0', conf);
            assert.isTrue(deleted);

            // Should remain the same
            assert.equal(await Demand.getDemandListLength(conf), amountOfDemands);
        });
    });
});
