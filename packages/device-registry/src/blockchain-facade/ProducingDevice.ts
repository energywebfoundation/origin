import polly from 'polly-js';

import { Compliance, Configuration } from '@energyweb/utils-general';

import { ProducingDevicePropertiesOffChainSchema } from '..';
import * as Device from './Device';

export interface IOffChainProperties extends Device.IOffChainProperties {
    deviceType: string;
    complianceRegistry: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
}

export const getAllDevices = async (configuration: Configuration.Entity): Promise<Entity[]> => {
    const { deviceLogicInstance } = configuration.blockchainProperties;
    const deviceListLength = parseInt(await deviceLogicInstance.getDeviceListLength(), 10);

    const devicesPromises = Array(deviceListLength)
        .fill(null)
        .map(async (item, index) => {
            return {
                id: index,
                device: await deviceLogicInstance.getDevice(index)
            };
        });

    const allDevices = await Promise.all(devicesPromises);

    const producingDevices = allDevices.filter(
        (device, index) => Number(device.device.usageType) === Device.UsageType.Producing
    );
    const producingDevicesSynced = producingDevices.map(device =>
        new Entity(device.id.toString(), configuration).sync()
    );

    return Promise.all(producingDevicesSynced);
};

export const getDeviceListLength = async (configuration: Configuration.Entity) => {
    const producingDevices = await getAllDevices(configuration);
    return producingDevices.length;
};

export const getAllDevicesOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllDevices(configuration)).filter(
        (device: Entity) => device.owner.address.toLowerCase() === owner.toLowerCase()
    );
};

export const createDevice = async (
    devicePropertiesOnChain: Device.IOnChainProperties,
    devicePropertiesOffChain: IOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const producingDevice = new Entity(null, configuration);
    const offChainStorageProperties = producingDevice.prepareEntityCreation(
        devicePropertiesOffChain,
        ProducingDevicePropertiesOffChainSchema
    );

    devicePropertiesOnChain.url = `${producingDevice.baseUrl}/${offChainStorageProperties.rootHash}`;
    devicePropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;

    await polly()
        .waitAndRetry(10)
        .executeForPromise(async () => {
            producingDevice.id = (await getDeviceListLength(configuration)).toString();
            await producingDevice.throwIfExists();
        });

    await producingDevice.syncOffChainStorage(devicePropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateDevice,
        logs
    } = await configuration.blockchainProperties.deviceLogicInstance.createDevice(
        devicePropertiesOnChain.smartMeter.address,
        devicePropertiesOnChain.owner.address,
        devicePropertiesOnChain.status,
        Device.UsageType.Producing,
        devicePropertiesOnChain.propertiesDocumentHash,
        devicePropertiesOnChain.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    if (!successCreateDevice) {
        await producingDevice.deleteFromOffChainStorage();
        throw new Error('createDevice: Saving on-chain data failed. Reverting...');
    }

    const idFromTx = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[1])
        .toString();

    if (producingDevice.id !== idFromTx) {
        producingDevice.id = idFromTx;
        await producingDevice.syncOffChainStorage(
            devicePropertiesOffChain,
            offChainStorageProperties
        );
    }

    if (configuration.logger) {
        configuration.logger.info(`Producing device ${producingDevice.id} created`);
    }

    return producingDevice.sync();
};
export interface IProducingDevice extends Device.IOnChainProperties {
    offChainProperties: IOffChainProperties;
}

export class Entity extends Device.Entity implements IProducingDevice {
    offChainProperties: IOffChainProperties;

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const device = await this.configuration.blockchainProperties.deviceLogicInstance.getDeviceById(
                this.id
            );

            this.smartMeter = { address: device.smartMeter };
            this.owner = { address: device.owner };
            this.lastSmartMeterReadWh = Number(device.lastSmartMeterReadWh);
            this.status = Number(device.status);
            this.usageType = Number(device.usageType);
            this.lastSmartMeterReadFileHash = device.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = device.propertiesDocumentHash;
            this.url = device.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties();
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing device ${this.id} synced`);
            }
        }

        return this;
    }
}
