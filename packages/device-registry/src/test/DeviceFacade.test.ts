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
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';
import { DeviceStatus, IDevice } from '@energyweb/origin-backend-core';

import { DeviceLogic, ProducingDevice, Device } from '..';
import { logger } from '../Logger';
import { migrateDeviceRegistryContracts } from '../utils/migrateContracts';

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

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', accountDeployment, {
            privateKey: privateKeyDeployment
        });

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
        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', deviceOwnerAddress, {
            privateKey: privateKeyDeployment
        });
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
                offChainDataSource: new OffChainDataSourceMock(),
                logger
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const deviceProps: Device.IOnChainProperties = {
                smartMeter: { address: deviceSmartmeter },
                owner: { address: deviceOwnerAddress },
            };

            const devicePropsOffChain: IDevice = {
                status: DeviceStatus.Active,
                operationalSince: 0,
                capacityInW: 10,
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
                province: '',
                smartMeterReads: []
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
                offChainProperties: devicePropsOffChain
            } as Partial<ProducingDevice.Entity>);

            assert.equal(await ProducingDevice.getDeviceListLength(conf), 1);
        });

        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceSmartmeter,
                privateKey: deviceSmartmeterPK
            };
            let device = await new ProducingDevice.Entity('0', conf).sync();

            device = await device.sync();

            assert.deepOwnInclude(device, {
                initialized: true,
                smartMeter: { address: deviceSmartmeter },
                owner: { address: deviceOwnerAddress },
                offChainProperties: {
                    status: DeviceStatus.Active,
                    operationalSince: 0,
                    capacityInW: 10,
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
                    province: '',
                    smartMeterReads: []
                }
            } as Partial<ProducingDevice.Entity>);
        });

        describe('Smart Meter Readings', () => {
            it('should correctly return reads', async () => {
                const device = await new ProducingDevice.Entity('0', conf).sync();
                await device.saveSmartMeterRead(100, SM_READ_TIMESTAMP);
                await device.saveSmartMeterRead(300, SM_READ_TIMESTAMP+1);
                const reads = await device.getSmartMeterReads();

                assert.deepEqual(reads, [
                    {
                        meterReading: 100,
                        timestamp: SM_READ_TIMESTAMP
                    },
                    {
                        meterReading: 300,
                        timestamp: SM_READ_TIMESTAMP + 1
                    }
                ]);

                const energyGenerated = await device.getAmountOfEnergyGenerated();
                assert.deepEqual(energyGenerated, [
                    {
                        energy: 100,
                        timestamp: SM_READ_TIMESTAMP
                    },
                    {
                        energy: 200,
                        timestamp: SM_READ_TIMESTAMP + 1
                    }
                ]);
            });
        });
    });
});
