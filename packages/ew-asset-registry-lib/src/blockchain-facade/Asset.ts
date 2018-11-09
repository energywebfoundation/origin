import * as GeneralLib from 'ew-utils-general-lib';

export interface OnChainProperties extends GeneralLib.BlockchainDataModelEntity.OnChainProperties {
    certificatesUsedForWh: number;
    smartMeter: GeneralLib.Configuration.EthAccount;
    owner: GeneralLib.Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    active: boolean;
    lastSmartMeterReadFileHash: string;
    matcher: GeneralLib.Configuration.EthAccount[];

}

export interface OffChainProperties {
    operationalSince: number;
    capacityWh: number;
    country: string;
    region: string;
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    gpsLatitude: string;
    gpsLongitude: string;
}

export abstract class Entity extends GeneralLib.BlockchainDataModelEntity.Entity
    implements OnChainProperties {

    offChainProperties: OffChainProperties;
    certificatesUsedForWh: number;
    smartMeter: GeneralLib.Configuration.EthAccount;
    owner: GeneralLib.Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    lastSmartMeterReadFileHash: string;
    matcher: GeneralLib.Configuration.EthAccount[];
    propertiesDocumentHash: string;
    url: string;
    active: boolean;

    initialized: boolean;

    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

}
