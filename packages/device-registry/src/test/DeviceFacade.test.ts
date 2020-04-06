/* eslint-disable import/no-extraneous-dependencies */
import 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';
import { DeviceStatus, IDevice } from '@energyweb/origin-backend-core';

import { ProducingDevice } from '..';
import { logger } from '../Logger';

describe('Device Facade', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    const deviceSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const deviceSmartmeter = web3.eth.accounts.privateKeyToAccount(deviceSmartmeterPK).address;

    const SM_READ_TIMESTAMP = moment().unix();

    describe('ProducingDevice', () => {
        it('should onboard a new producing device', async () => {
            conf = {
                blockchainProperties: {
                    activeUser: {
                        address: accountDeployment,
                        privateKey: privateKeyDeployment
                    },
                    web3
                },
                offChainDataSource: new OffChainDataSourceMock(),
                logger
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const deviceProps: IDevice = {
                id: 1,
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
                organization: 4
            };

            assert.equal(await ProducingDevice.getDeviceListLength(conf), 0);

            const device = await ProducingDevice.createDevice(deviceProps, conf);
            assert.deepOwnInclude(device, deviceProps);

            assert.equal(await ProducingDevice.getDeviceListLength(conf), 1);
        });

        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: deviceSmartmeter,
                privateKey: deviceSmartmeterPK
            };
            let device = await new ProducingDevice.Entity(1, conf).sync();

            device = await device.sync();

            assert.deepOwnInclude(device, {
                initialized: true,
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
                province: ''
            } as Partial<ProducingDevice.Entity>);
        });

        describe('Smart Meter Readings', () => {
            it('should correctly return reads', async () => {
                let device = await new ProducingDevice.Entity(1, conf).sync();
                await device.saveSmartMeterRead(100, SM_READ_TIMESTAMP);
                await device.saveSmartMeterRead(300, SM_READ_TIMESTAMP + 1);

                device = await device.sync();

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

                assert.equal(device.lastSmartMeterReadWh, 300);
            });
        });
    });
});
