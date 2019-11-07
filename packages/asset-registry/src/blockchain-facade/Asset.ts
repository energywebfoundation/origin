import moment from 'moment';
import { TransactionReceipt } from 'web3/types';

import { BlockchainDataModelEntity, Configuration } from '@energyweb/utils-general';
import { AssetLogic } from '../wrappedContracts/AssetLogic';

export interface IOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    active: boolean;
    lastSmartMeterReadFileHash: string;
}

export interface IOffChainProperties {
    operationalSince: number;
    capacityWh: number;
    country: string;
    address: string;
    gpsLatitude: string;
    gpsLongitude: string;
    timezone: string;
    facilityName: string;
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
    propertiesDocumentHash: string;
    url: string;
    active: boolean;

    initialized: boolean;

    configuration: Configuration.Entity;

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
            return this.configuration.blockchainProperties.assetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                timestamp,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.assetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                timestamp,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getSmartMeterReads(): Promise<ISmartMeterRead[]> {
        const logic: AssetLogic = this.configuration.blockchainProperties
            .assetLogicInstance;

        return (await logic.getSmartMeterReadsForAsset(Number(this.id))).map((read: ISmartMeterRead) => ({
            energy: Number(read.energy),
            timestamp: Number(read.timestamp)
        }));
    }
}
