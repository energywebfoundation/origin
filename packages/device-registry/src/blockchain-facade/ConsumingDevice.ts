import { Configuration } from '@energyweb/utils-general';
import * as Device from './Device';
import { DevicePropertiesOffChainSchema } from '..';

export const createDevice = async (
    deviceProperties: Device.IOnChainProperties,
    devicePropertiesOffChain: Device.IOffChainProperties,
    configuration: Configuration.Entity
): Promise<Device.Entity> => {
    const consumingDevice = new Entity(null, configuration);
    const offChainStorageProperties = consumingDevice.prepareEntityCreation(
        devicePropertiesOffChain,
        DevicePropertiesOffChainSchema
    );

    if (configuration.offChainDataSource) {
        deviceProperties.url = consumingDevice.getUrl();
        deviceProperties.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.deviceLogicInstance.createDevice(
        deviceProperties.smartMeter.address,
        deviceProperties.owner.address,
        deviceProperties.active,
        Device.UsageType.Consuming,
        deviceProperties.propertiesDocumentHash,
        deviceProperties.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    consumingDevice.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await consumingDevice.syncOffChainStorage(devicePropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Consuming device ${consumingDevice.id} created`);
    }

    return consumingDevice.sync();
};

export const getAllDevices = async (configuration: Configuration.Entity): Promise<Entity[]> => {
    const deviceLogicInstance = configuration.blockchainProperties.deviceLogicInstance;
    const deviceListLength = parseInt(await deviceLogicInstance.getDeviceListLength(), 10);

    const devicesPromises = Array(deviceListLength).fill(null).map(async (item, index) => {
        return {
            id: index,
            device: await deviceLogicInstance.getDevice(index)
        };
    });

    const allDevices = await Promise.all(devicesPromises);

    const consumingDevices = allDevices.filter((device, index) => Number(device.device.usageType) === Device.UsageType.Consuming);
    const consumingDevicesSynced = consumingDevices.map(device => new Entity(device.id.toString(), configuration).sync());

    return Promise.all(consumingDevicesSynced);
};

export const getDeviceListLength = async (configuration: Configuration.Entity) => {
    const consumingDevices = await getAllDevices(configuration);
    return consumingDevices.length;
};

export const getAllDevicesOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllDevices(configuration)).filter(
        (device: Entity) => device.owner.address.toLowerCase() === owner.toLowerCase()
    );
};

export interface IConsumingDevice extends Device.IOnChainProperties {
    offChainProperties: Device.IOffChainProperties
}

export class Entity extends Device.Entity implements IConsumingDevice {
    offChainProperties: Device.IOffChainProperties;

    getUrl(): string {
        const consumingDeviceLogicAddress = this.configuration.blockchainProperties.deviceLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/ConsumingDevice/${consumingDeviceLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        const device = await this.configuration.blockchainProperties.deviceLogicInstance.getDeviceById(
            this.id
        );

        if (this.id != null) {
            this.smartMeter = { address: device.smartMeter };
            this.owner = { address: device.owner };
            this.lastSmartMeterReadWh = Number(device.lastSmartMeterReadWh);
            this.active = device.active;
            this.usageType = Number(device.usageType);
            this.lastSmartMeterReadFileHash = device.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = device.propertiesDocumentHash;
            this.url = device.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Consuming device ${this.id} synced`);
            }
        }

        return this;
    }
}
