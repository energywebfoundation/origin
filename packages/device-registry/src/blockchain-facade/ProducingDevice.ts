import moment from 'moment';
import { Configuration } from '@energyweb/utils-general';
import {
    IDevice,
    ISmartMeterRead,
    IEnergyGenerated,
    DeviceStatus,
    IExternalDeviceId,
    DeviceCreateData,
    IDeviceWithRelationsIds
} from '@energyweb/origin-backend-core';

export class Entity implements IDevice {
    status: DeviceStatus;

    facilityName: string;

    description: string;

    images: string;

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

    complianceRegistry: string;

    otherGreenAttributes: string;

    typeOfPublicSupport: string;

    externalDeviceIds?: IExternalDeviceId[];

    lastSmartMeterReading?: ISmartMeterRead;

    deviceGroup?: string;

    smartMeterReads: ISmartMeterRead[];

    initialized: boolean;

    organization: number;

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

    get lastSmartMeterReadWh(): number {
        return this.lastSmartMeterReading?.meterReading;
    }

    async saveSmartMeterRead(
        meterReading: number,
        timestamp: number = moment().unix()
    ): Promise<void> {
        return this.configuration.offChainDataSource.deviceClient.addSmartMeterRead(
            Number(this.id),
            {
                meterReading,
                timestamp
            }
        );
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
                energy:
                    allMeterReadings[i].meterReading -
                    (isFirstReading ? 0 : allMeterReadings[i - 1].meterReading),
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
