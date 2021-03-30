import {
    IDevice,
    ISmartMeterRead,
    IEnergyGenerated,
    DeviceStatus,
    IExternalDeviceId,
    DeviceCreateData,
    ISmartMeterReadStats,
    ISuccessResponse
} from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { Configuration } from '..';

export class Entity implements IDevice {
    status: DeviceStatus;

    facilityName: string;

    description: string;

    images: string;

    files: string;

    address: string;

    region: string;

    province: string;

    country: string;

    operationalSince: number;

    capacityInW: number;

    gpsLatitude: string;

    gpsLongitude: string;

    timezone: string;

    deviceType: string;

    gridOperator: string;

    complianceRegistry: string;

    otherGreenAttributes: string;

    typeOfPublicSupport: string;

    externalDeviceIds?: IExternalDeviceId[];

    meterStats?: ISmartMeterReadStats;

    deviceGroup?: string;

    smartMeterReads: ISmartMeterRead[];

    initialized: boolean;

    organizationId: number;

    automaticPostForSale: boolean;

    defaultAskPrice?: number;

    constructor(public id: number, public configuration: Configuration.Entity, data?: IDevice) {
        if (data) {
            Object.assign(this, data);
            this.initialized = true;
        } else {
            this.initialized = false;
        }
    }

    async sync(): Promise<Entity> {
        if (this.id !== null) {
            const { data: device } = await this.configuration.deviceClient.get(this.id.toString());

            Object.assign(this, device);

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing device ${this.id} synced`);
            }
        }

        return this;
    }

    async saveSmartMeterReads(smReads: ISmartMeterRead[]): Promise<ISuccessResponse> {
        const { data: successResponse } = await this.configuration.deviceClient.addSmartMeterReads(
            this.id.toString(),
            smReads.map((smRead) => ({
                meterReading: smRead.meterReading.toString(),
                timestamp: smRead.timestamp
            }))
        );

        return successResponse;
    }

    async getSmartMeterReads(): Promise<ISmartMeterRead[]> {
        const { data } = await this.configuration.deviceClient.getAllSmartMeterReadings(
            this.id.toString()
        );
        return data.map((smRead: any) => ({
            ...smRead,
            meterReading: BigNumber.from(smRead.meterReading)
        }));
    }

    async getAmountOfEnergyGenerated(): Promise<IEnergyGenerated[]> {
        const allMeterReadings = await this.getSmartMeterReads();

        if (!allMeterReadings) {
            return [];
        }

        const energiesGenerated: IEnergyGenerated[] = [];

        for (let i = 0; i < allMeterReadings.length; i++) {
            const isFirstReading = i === 0;

            energiesGenerated.push({
                energy: BigNumber.from(
                    allMeterReadings[i].meterReading.sub(
                        isFirstReading ? 0 : allMeterReadings[i - 1].meterReading
                    )
                ),
                timestamp: allMeterReadings[i].timestamp
            });
        }

        return energiesGenerated;
    }

    async setStatus(status: DeviceStatus) {
        const { data: result } = await this.configuration.deviceClient?.updateDeviceStatus(
            this.id.toString(),
            {
                status
            }
        );

        return result;
    }
}

export const getAllDevices = async (
    configuration: Configuration.Entity,
    withMeterStats = false
): Promise<Entity[]> => {
    const { data: allDevices } = await configuration.deviceClient.getAll(withMeterStats);

    return allDevices.map((device: any) => {
        const transformedDevice = {
            ...device,
            meterStats: {
                certified: device.meterStats?.certified ?? '0',
                uncertified: device.meterStats?.uncertified ?? '0'
            }
        };

        return new Entity(device.id, configuration, transformedDevice);
    });
};

export const createDevice = async (
    deviceProperties: DeviceCreateData,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const producingDevice = new Entity(null, configuration);

    const { data: deviceWithId } = await configuration.deviceClient.createDevice({
        ...deviceProperties,
        smartMeterReads: deviceProperties.smartMeterReads?.map((smRead) => ({
            ...smRead,
            meterReading: smRead.meterReading.toString()
        }))
    });

    producingDevice.id = deviceWithId.id;

    if (configuration.logger) {
        configuration.logger.info(`Producing device ${deviceWithId.id} created`);
    }

    return producingDevice.sync();
};
