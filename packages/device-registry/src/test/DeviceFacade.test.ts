import 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import {
    buildRights,
    Role,
    UserLogic,
    Contracts as UserRegistryContracts
} from '@energyweb/user-registry';
import { Configuration } from '@energyweb/utils-general';

import { OffChainDataClientMock, ConfigurationClientMock } from '@energyweb/origin-backend-client';
import { DeviceLogic, ProducingDevice, Device, ConsumingDevice } from '..';
import { logger } from '../Logger';
import { migrateDeviceRegistryContracts } from '../utils/migrateContracts';
import { DeviceStatus } from '../blockchain-facade/Device';

describe('Device Facade', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    let deviceLogic: DeviceLogic;
    let userLogic: UserLogic;

    const deviceOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const deviceOwnerAddress = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const deviceSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const deviceSmartmeter = web3.eth.accounts.privateKeyToAccount(deviceSmartmeterPK).address;

    const deviceSmartmeter2PK =
        '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const deviceSmartMeter2 = web3.eth.accounts.privateKeyToAccount(deviceSmartmeter2PK).address;

    const SM_READ_TIMESTAMP = moment().unix();

    it('should deploy user-registry contracts', async () => {
        userLogic = await UserRegistryContracts.migrateUserRegistryContracts(
            web3,
            privateKeyDeployment
        );

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            accountDeployment,
            buildRights([Role.UserAdmin, Role.DeviceAdmin]),
            { privateKey: privateKeyDeployment }
        );
    });

    it('should deploy device-registry contracts', async () => {
        deviceLogic = await migrateDeviceRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            deviceOwnerAddress,
            'deviceOwner',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(
            deviceOwnerAddress,
            buildRights([Role.DeviceManager, Role.DeviceAdmin]),
            { privateKey: privateKeyDeployment }
        );
    });

    describe('ProducingDevice', () => {
        it('should onboard a new producing device', async () => {
            conf = {
                blockchainProperties: {
                    activeUser: {
                        address: accountDeployment,
                        privateKey: privateKeyDeployment
                    },
                    deviceLogicInstance: deviceLogic,
                    userLogicInstance: userLogic,
                    web3
                },
                offChainDataSource: {
                    baseUrl: `${process.env.BACKEND_URL}/api`,
                    client: new OffChainDataClientMock(),
                    configurationClient: new ConfigurationClientMock()
                },
                logger
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const deviceProps: Device.IOnChainProperties = {
                smartMeter: { address: deviceSmartmeter },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 0,
                status: DeviceStatus.Active,
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
                facilityName: FACILITY_NAME,
                description: '',
                images: '',
                region: '',
                province: ''
            };

            assert.equal(await ProducingDevice.getDeviceListLength(conf), 0);

            const device = await ProducingDevice.createDevice(
                deviceProps,
                devicePropsOffChain,
                conf
            );

            assert.deepOwnInclude(device, {
                id: '0',
                initialized: true,
                smartMeter: { address: deviceSmartmeter },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 0,
                status: DeviceStatus.Active,
                usageType: Device.UsageType.Producing,
                lastSmartMeterReadFileHash: '',
                offChainProperties: devicePropsOffChain,
                url: `${process.env.BACKEND_URL}/api/Entity/${device.propertiesDocumentHash}`
            } as Partial<ProducingDevice.Entity>);

            assert.equal(await ProducingDevice.getDeviceListLength(conf), 1);
        });

        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceSmartmeter,
                privateKey: deviceSmartmeterPK
            };
            let device = await new ProducingDevice.Entity('0', conf).sync();

            await device.saveSmartMeterRead(100, 'newFileHash', SM_READ_TIMESTAMP);

            device = await device.sync();

            assert.deepOwnInclude(device, {
                id: '0',
                initialized: true,
                smartMeter: { address: deviceSmartmeter },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 100,
                status: DeviceStatus.Active,
                usageType: Device.UsageType.Producing,
                lastSmartMeterReadFileHash: 'newFileHash',
                url: `${process.env.BACKEND_URL}/api/Entity/${device.propertiesDocumentHash}`,
                offChainProperties: {
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
                    facilityName: 'Wuthering Heights Windfarm',
                    description: '',
                    images: '',
                    region: '',
                    province: ''
                }
            } as Partial<ProducingDevice.Entity>);
        });

        describe('getSmartMeterReads', () => {
            it('should correctly return reads', async () => {
                const device = await new ProducingDevice.Entity('0', conf).sync();
                const reads = await device.getSmartMeterReads();

                assert.deepEqual(reads, [
                    {
                        energy: 100,
                        timestamp: SM_READ_TIMESTAMP
                    }
                ]);
            });
        });
    });

    describe('ConsumingDevice', () => {
        it('should onboard a new consuming device', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceOwnerAddress,
                privateKey: deviceOwnerPK
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const deviceProps: Device.IOnChainProperties = {
                smartMeter: { address: deviceSmartMeter2 },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 0,
                status: DeviceStatus.Active,
                usageType: Device.UsageType.Consuming,
                lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
                propertiesDocumentHash: null,
                url: null
            };

            const devicePropsOffChain: Device.IOffChainProperties = {
                operationalSince: 0,
                capacityWh: 10,
                country: 'Thailand',
                address:
                    '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                gpsLatitude: '0.0123123',
                gpsLongitude: '31.1231',
                timezone: 'Asia/Bangkok',
                facilityName: FACILITY_NAME,
                description: '',
                images: '',
                region: '',
                province: ''
            };

            assert.equal(await ConsumingDevice.getDeviceListLength(conf), 0);

            const device = await ConsumingDevice.createDevice(
                deviceProps,
                devicePropsOffChain,
                conf
            );

            assert.deepOwnInclude(device, {
                initialized: true,
                smartMeter: { address: deviceSmartMeter2 },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 0,
                status: DeviceStatus.Active,
                usageType: Device.UsageType.Consuming,
                lastSmartMeterReadFileHash: '',
                offChainProperties: devicePropsOffChain,
                url: `${process.env.BACKEND_URL}/api/Entity/${device.propertiesDocumentHash}`
            } as Partial<ConsumingDevice.Entity>);

            assert.equal(await ConsumingDevice.getDeviceListLength(conf), 1);
        });

        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceSmartMeter2,
                privateKey: deviceSmartmeter2PK
            };
            let device = (await ConsumingDevice.getAllDevices(conf))[0];
            device = await device.sync();

            await device.saveSmartMeterRead(100, 'newFileHash', SM_READ_TIMESTAMP);

            device = await device.sync();

            assert.deepOwnInclude(device, {
                id: '1',
                initialized: true,
                smartMeter: { address: deviceSmartMeter2 },
                owner: { address: deviceOwnerAddress },
                lastSmartMeterReadWh: 100,
                status: DeviceStatus.Active,
                usageType: Device.UsageType.Consuming,
                lastSmartMeterReadFileHash: 'newFileHash',
                url: `${process.env.BACKEND_URL}/api/Entity/${device.propertiesDocumentHash}`,
                offChainProperties: {
                    operationalSince: 0,
                    capacityWh: 10,
                    country: 'Thailand',
                    address:
                        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                    gpsLatitude: '0.0123123',
                    gpsLongitude: '31.1231',
                    timezone: 'Asia/Bangkok',
                    facilityName: 'Wuthering Heights Windfarm',
                    description: '',
                    images: '',
                    region: '',
                    province: ''
                }
            } as Partial<ConsumingDevice.Entity>);
        });

        describe('getSmartMeterReads ConsumingDevice', () => {
            it('should correctly return reads', async () => {
                let device = (await ConsumingDevice.getAllDevices(conf))[0];
                device = await device.sync();
                const reads = await device.getSmartMeterReads();

                assert.deepEqual(reads, [
                    {
                        energy: 100,
                        timestamp: SM_READ_TIMESTAMP
                    }
                ]);
            });
        });
    });
});
