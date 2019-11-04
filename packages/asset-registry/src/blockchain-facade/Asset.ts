import { BlockchainDataModelEntity, Configuration } from '@energyweb/utils-general';

export interface IOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    // certificatesUsedForWh: number;
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

export abstract class Entity extends BlockchainDataModelEntity.Entity
    implements IOnChainProperties {
    offChainProperties: IOffChainProperties;
    certificatesUsedForWh: number;
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
}
