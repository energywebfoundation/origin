import moment from 'moment';
import { TransactionReceipt } from 'web3-core';

import { BlockchainDataModelEntity, Configuration, Timestamp } from '@energyweb/utils-general';
import { DeviceLogic } from '../wrappedContracts/DeviceLogic';

export enum DeviceStatus {
    Submitted,
    Denied,
    Active
}

export enum UsageType {
    Producing,
    Consuming
}

export interface IOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    status: DeviceStatus;
    usageType: UsageType;
    lastSmartMeterReadFileHash: string;
}

export interface IOffChainProperties {
    operationalSince: Timestamp;
    capacityInW: number;
    country: string;
    address: string;
    gpsLatitude: string;
    gpsLongitude: string;
    timezone: string;
    facilityName: string;
    description: string;
    images: string;
    region: string;
    province: string;
    deviceGroup?: string;
}

export interface ISmartMeterRead {
    energy: number;
    timestamp: number;
}

export abstract class Entity extends BlockchainDataModelEntity.Entity
    implements IOnChainProperties {
    offChainProperties: IOffChainProperties;

    smartMeter: Configuration.EthAccount;

    owner: Configuration.EthAccount;

    lastSmartMeterReadWh: number;

    lastSmartMeterReadFileHash: string;

    status: DeviceStatus;

    usageType: UsageType;

    initialized: boolean;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    async saveSmartMeterRead(
        meterReading: number,
        filehash: string,
        timestamp: number = moment().unix()
    ): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.deviceLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                timestamp,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.deviceLogicInstance.saveSmartMeterRead(
            this.id,
            meterReading,
            filehash,
            timestamp,
            { from: this.configuration.blockchainProperties.activeUser.address }
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

    async setStatus(status: DeviceStatus): Promise<TransactionReceipt> {
        const {
            deviceLogicInstance
        }: { deviceLogicInstance?: DeviceLogic } = this.configuration.blockchainProperties;
        const id = parseInt(this.id, 10);

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return deviceLogicInstance.setStatus(id, status, {
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            });
        }

        return deviceLogicInstance.setStatus(id, status, {
            from: this.configuration.blockchainProperties.activeUser.address
        });
    }
}
