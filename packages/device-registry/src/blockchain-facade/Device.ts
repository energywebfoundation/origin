import moment from 'moment';
import { TransactionReceipt } from 'web3-core';

import { IDevice, DeviceStatus } from '@energyweb/origin-backend-core';
import { BlockchainDataModelEntity, Configuration } from '@energyweb/utils-general';

import { DeviceLogic } from '../wrappedContracts/DeviceLogic';

export interface IOnChainProperties {
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    lastSmartMeterReadFileHash: string;
}

export interface ISmartMeterRead {
    energy: number;
    timestamp: number;
}

export abstract class Entity extends BlockchainDataModelEntity.Entity implements IOnChainProperties {
    offChainProperties: IDevice;

    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    lastSmartMeterReadFileHash: string;

    initialized: boolean;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    async createOffChainProperties(devicePropertiesOffChain: IDevice) {
        return this.configuration.offChainDataSource.deviceClient.add(Number(this.id), devicePropertiesOffChain);
    }

    async getOffChainProperties(): Promise<any> {
        return this.configuration.offChainDataSource.deviceClient.getById(Number(this.id));
    }

    async saveSmartMeterRead(
        meterReading: number,
        filehash: string,
        timestamp: number = moment().unix()
    ): Promise<TransactionReceipt> {
        return this.configuration.blockchainProperties.deviceLogicInstance.saveSmartMeterRead(
            this.id,
            meterReading,
            filehash,
            timestamp,
            Configuration.getAccount(this.configuration)
        );
    }

    async getSmartMeterReads(): Promise<ISmartMeterRead[]> {
        const logic: DeviceLogic = this.configuration.blockchainProperties.deviceLogicInstance;

        return (await logic.getSmartMeterReadsForDevice(Number(this.id))).map(
            (read: ISmartMeterRead) => ({
                energy: Number(read.energy),
                timestamp: Number(read.timestamp)
            })
        );
    }

    async getSmartMeterReadsByIndex(indexes: number[]): Promise<ISmartMeterRead[]> {
        const logic: DeviceLogic = this.configuration.blockchainProperties.deviceLogicInstance;

        return (await logic.getSmartMeterReadsForDeviceByIndex(Number(this.id), indexes)).map(
            (read: ISmartMeterRead) => ({
                energy: Number(read.energy),
                timestamp: Number(read.timestamp)
            })
        );
    }

    async setStatus(status: DeviceStatus): Promise<IDevice> {
        return this.configuration.offChainDataSource.deviceClient.update(Number(this.id), { status });
    }
}
