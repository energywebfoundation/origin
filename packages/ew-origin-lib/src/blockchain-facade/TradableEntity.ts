import * as GeneralLib from 'ew-utils-general-lib';

export interface OnChainProperties {
    assetId: number;
    owner: GeneralLib.Configuration.EthAccount;
    powerInW: number;
    acceptedToken?: number;
    onCHainDirectPurchasePrice: number;
    escrow: GeneralLib.Configuration.EthAccount[];
    approvedAddress: GeneralLib.Configuration.EthAccount;
}

export abstract class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements OnChainProperties {
    assetId: number;
    owner: GeneralLib.Configuration.EthAccount;
    powerInW: number;
    acceptedToken?: number;
    onCHainDirectPurchasePrice: number;
    escrow: GeneralLib.Configuration.EthAccount[];
    approvedAddress: GeneralLib.Configuration.EthAccount;

    initialized: boolean;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;

    }
}