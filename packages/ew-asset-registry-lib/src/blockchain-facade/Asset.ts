import * as Configuration from '../Configuration';
import * as BlockchainDataModel from '../BlockchainDataModelEntity';

export interface OnChainProperties extends BlockchainDataModel.OnChainProperties {
    certificatesUsedForWh: number;
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    active: boolean;
    lastSmartMeterReadFileHash: string;
    matcher: Configuration.EthAccount[];

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

export abstract class Entity extends BlockchainDataModel.Entity  implements OnChainProperties {

    offChainProperties: OffChainProperties;
    certificatesUsedForWh: number;
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    lastSmartMeterReadFileHash: string;
    matcher: Configuration.EthAccount[];
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
