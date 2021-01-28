/* eslint-disable import/no-extraneous-dependencies  */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import { BigNumber } from 'ethers';
import dotenv from 'dotenv';
import { DeviceClient } from '@energyweb/origin-backend-client';

import {
    DeviceCreateData,
    DeviceStatus,
    IPublicOrganization,
    ISmartMeterRead
} from '@energyweb/origin-backend-core';
import { Configuration, ProducingDevice } from '..';

import { logger } from '../Logger';

describe('Device Facade', () => {
    dotenv.config({
        path: '.env.test'
    });

    const SM_READ_TIMESTAMP = moment().unix();

    const deviceId = 1;
    const devices = new Map<string, any>();
    const smartMeterReads = new Map<string, ISmartMeterRead[]>();

    const conf: Configuration.Entity = {
        deviceClient: {
            createDevice: async (deviceProperties: DeviceCreateData) => {
                const device = {
                    id: deviceId,
                    organizationId: 0,
                    ...deviceProperties
                };
                devices.set(deviceId.toString(), device);
                return { data: device };
            },
            get: async (id: string) => {
                return { data: devices.get(id) };
            },
            getAll: async (withMeterStats = false) => {
                return { data: Array.from(devices.values()) ?? [] } as any;
            },
            addSmartMeterReads: async (id: string, smReads: ISmartMeterRead[]) => {
                const existing = smartMeterReads.get(id) ?? [];
                const newSmReads = [...existing, ...smReads];
                smartMeterReads.set(id.toString(), newSmReads);

                return { data: newSmReads } as any;
            },
            getAllSmartMeterReadings: async (id: string) => {
                return { data: smartMeterReads.get(id) ?? [] };
            }
        } as Partial<DeviceClient>,
        logger
    } as Configuration.Entity;

    describe('ProducingDevice', () => {
        it('should onboard a new producing device', async () => {
            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const deviceProps: DeviceCreateData = {
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
                gridOperator: '',
                automaticPostForSale: false
            };

            const device = await ProducingDevice.createDevice(deviceProps, conf);
            assert.deepOwnInclude(device, deviceProps);

            assert.equal((await ProducingDevice.getAllDevices(conf)).length, 1);
        });

        it('should log a new meter reading', async () => {
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
                await device.saveSmartMeterReads([
                    { meterReading: BigNumber.from(100), timestamp: SM_READ_TIMESTAMP },
                    { meterReading: BigNumber.from(300), timestamp: SM_READ_TIMESTAMP + 1 }
                ]);

                device = await device.sync();

                const reads = await device.getSmartMeterReads();

                assert.deepOwnInclude(reads[0], {
                    meterReading: BigNumber.from(100),
                    timestamp: SM_READ_TIMESTAMP
                });
                assert.deepOwnInclude(reads[1], {
                    meterReading: BigNumber.from(300),
                    timestamp: SM_READ_TIMESTAMP + 1
                });

                const energyGenerated = await device.getAmountOfEnergyGenerated();
                assert.deepOwnInclude(energyGenerated[0], {
                    energy: BigNumber.from(100),
                    timestamp: SM_READ_TIMESTAMP
                });

                assert.deepOwnInclude(energyGenerated[1], {
                    energy: BigNumber.from(200),
                    timestamp: SM_READ_TIMESTAMP + 1
                });
            });
        });
    });
});
