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
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';
import {
    DeviceStatus,
    UserRegisterData,
    IDevice,
    DemandPostData
} from '@energyweb/origin-backend-core';

import { logger } from '../Logger';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { MarketLogic, Demand, MarketUser } from '..';
import { IDemandEntity } from '../blockchain-facade/Demand';

function createTestRegisterData(email: string): UserRegisterData {
    return {
        email,
        firstName: 'John',
        lastName: 'Doe',
        password: 'test',
        telephone: '111-111-111',
        title: 'Mr'
    };
}

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
            offChainDataSource: new OffChainDataSourceMock(`${process.env.BACKEND_URL}/api`),
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
                ])
            },
            {
                notifications: false
            },
            conf,
            createTestRegisterData('admin@example.com'),
            privateKeyDeployment
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: accountTrader,
                active: true,
                roles: buildRights([Role.Trader])
            },
            {
                notifications: false
            },
            conf,
            createTestRegisterData('trader@example.com'),
            traderPK
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: deviceOwnerAddress,
                active: true,
                roles: buildRights([Role.DeviceManager])
            },
            {
                notifications: false
            },
            conf,
            createTestRegisterData('deviceowner@example.com'),
            deviceOwnerPK
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: issuerAccount,
                active: true,
                roles: buildRights([Role.Issuer])
            },
            {
                notifications: false
            },
            conf,
            createTestRegisterData('issuer@example.com'),
            issuerPK
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: matcherAccount,
                active: true,
                roles: buildRights([Role.Matcher])
            },
            {
                notifications: false
            },
            conf,
            createTestRegisterData('matcher@example.com'),
            matcherPK
        );

        await MarketUser.createMarketUser(
            {
                url: null,
                propertiesDocumentHash: null,
                id: marketLogic.web3Contract.options.address,
                active: true,
                roles: buildRights([Role.Matcher])
            },
            {
                notifications: false
            },
            conf
        );
    });

    it('should update MarketUser off-chain properties', async () => {
        let user = await new MarketUser.Entity(accountDeployment, conf).sync();
        await user.update({
            notifications: true
        });

        user = await user.sync();

        assert.deepEqual(user.offChainProperties, {
            notifications: true
        });
    });

    it('should not update user properties when blockchain tx fails', async () => {
        const newNotifications = false;

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
        newOffChainProperties.notifications = newNotifications;

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
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash'
        };

        const devicePropsOffChain: Omit<IDevice, 'id'> = {
            status: DeviceStatus.Active,
            operationalSince: 0,
            capacityInW: 10,
            country: 221,
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '0.0123123',
            gpsLongitude: '31.1231',
            timezone: 'Asia/Bangkok',
            deviceType: 'Wind',
            complianceRegistry: 'I-REC',
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            facilityName: '',
            description: '',
            images: '',
            region: '',
            province: ''
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

            const demandOffChainProps: DemandPostData = {
                owner: accountTrader,
                timeFrame: TimeFrame.hourly,
                maxPriceInCentsPerMwh: 150,
                currency: 'USD',
                location: ['Thailand;Central;Nakhon Pathom'],
                deviceType: ['Solar'],
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
                id: 1,
                initialized: true,
                status: 0,
                owner: accountTrader,
                ...demandOffChainProps
            } as Partial<Demand.Entity>);
        });

        it('should return 1 demand for getAllDemands', async () => {
            const allDemands = await Demand.getAllDemands(conf);
            assert.equal(allDemands.length, 1);
        });

        it('should return demand', async () => {
            const demand: IDemandEntity = await new Demand.Entity(1, conf).sync();

            assert.ownInclude(demand, {
                id: 1,
                initialized: true,
                owner: accountTrader,
                status: 0,
                currency: 'USD',
                otherGreenAttributes: 'string',
                maxPriceInCentsPerMwh: 150,
                registryCompliance: 'I-REC',
                energyPerTimeFrame: 10,
                timeFrame: TimeFrame.hourly,
                typeOfPublicSupport: 'string',
                startTime: START_TIME,
                endTime: END_TIME
            } as Partial<Demand.Entity>);

            assert.deepEqual(demand.deviceType, ['Solar']);
            assert.deepEqual(demand.location, ['Thailand;Central;Nakhon Pathom']);
        });

        it('should clone demand', async () => {
            const demand = await new Demand.Entity(0, conf).sync();
            const clone = await demand.clone();

            assert.notEqual(clone.id, demand.id);
        });
    });
});
