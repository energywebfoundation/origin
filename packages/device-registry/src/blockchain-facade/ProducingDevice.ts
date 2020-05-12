import moment from 'moment';
import { Configuration } from '@energyweb/utils-general';
import {
    IDevice,
    ISmartMeterRead,
    IEnergyGenerated,
    DeviceStatus,
    IExternalDeviceId,
    DeviceCreateData,
    IDeviceWithRelationsIds,
    ISmartMeterReadStats
} from '@energyweb/origin-backend-core';
import { BigNumberish, bigNumberify } from 'ethers/utils';

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

    organization: number;

    automaticPostForSale: boolean;

    defaultAskPrice: number;

    constructor(
        public id: number,
        public configuration: Configuration.Entity,
        data?: IDeviceWithRelationsIds
    ) {
        if (data) {
            Object.assign(this, data);
            this.initialized = true;
        } else {
            this.initialized = false;
        }
    }
    

    async sync(): Promise<Entity> {
        if (this.id !== null) {
            const device = await this.configuration.offChainDataSource.deviceClient.getById(
                this.id
            );

            Object.assign(this, device);

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing device ${this.id} synced`);
            }
        }

        return this;
    }

    async saveSmartMeterRead(
        meterReading: BigNumberish,
        timestamp: number = moment().unix()
    ): Promise<void> {
        const readingBN = bigNumberify(meterReading);

        return this.configuration.offChainDataSource.deviceClient.addSmartMeterRead(this.id, {
            meterReading: readingBN,
            timestamp
        });
    }

    async getSmartMeterReads(): Promise<ISmartMeterRead[]> {
        return this.configuration.offChainDataSource.deviceClient.getAllSmartMeterReadings(
            Number(this.id)
        );
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
                energy: allMeterReadings[i].meterReading.sub(
                    isFirstReading ? 0 : allMeterReadings[i - 1].meterReading
                ),
                timestamp: allMeterReadings[i].timestamp
            });
        }

        return energiesGenerated;
    }

    async setStatus(status: DeviceStatus) {
        return this.configuration.offChainDataSource?.deviceClient?.update(this.id, {
            status
        });
    }
}

export const getAllDevices = async (configuration: Configuration.Entity): Promise<Entity[]> => {
    const allDevices = await configuration.offChainDataSource.deviceClient.getAll();

    return allDevices.map((device) => new Entity(device.id, configuration, device));
};

export const getDeviceListLength = async (configuration: Configuration.Entity) => {
    const allDevices = await configuration.offChainDataSource.deviceClient.getAll();
    return allDevices.length;
};

export const createDevice = async (
    deviceProperties: DeviceCreateData,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const producingDevice = new Entity(null, configuration);

    const deviceWithId = await configuration.offChainDataSource.deviceClient.add(deviceProperties);

    producingDevice.id = deviceWithId.id;

    if (configuration.logger) {
        configuration.logger.info(`Producing device ${deviceWithId.id} created`);
    }

    return producingDevice.sync();
};
