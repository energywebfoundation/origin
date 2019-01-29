import * as GeneralLib from 'ew-utils-general-lib';

export interface SupplyOnChainProperties extends GeneralLib.BlockchainDataModelEntity.OnChainProperties {
    assetId: number;
}

export const getSupplyListLength = async (configuration: GeneralLib.Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.demandLogicInstance.getAllDemandListLength(), 10);
};

export const createSupply =
    async (supplyPropertiesOnChain: SupplyOnChainProperties,
           configuration: GeneralLib.Configuration.Entity): Promise<Entity> => {
        const demand = new Entity(null, configuration);

        /*
        const offChainStorageProperties =
            demand.prepareEntityCreation(demandPropertiesOnChain, null, null);

        if (configuration.offChainDataSource) {
            demandPropertiesOnChain.url = demand.getUrl();
            demandPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
        }*/

        const tx = await configuration.blockchainProperties.demandLogicInstance.createSupply(
            supplyPropertiesOnChain.propertiesDocumentHash,
            supplyPropertiesOnChain.url,
            supplyPropertiesOnChain.assetId,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            },
        );

        demand.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

        //    await demand.putToOffChainStorage(null, offChainStorageProperties);

        configuration.logger.info(`Supply ${demand.id} created`);

        return demand.sync();

    };

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements SupplyOnChainProperties {

    propertiesDocumentHash: string;
    url: string;

    assetId: number;

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Supply`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const demand = await this.configuration.blockchainProperties.demandLogicInstance.getSupply(this.id);

            this.propertiesDocumentHash = demand._propertiesDocumentHash;
            this.url = demand._documentDBURL;
            this.assetId = demand._assetId;
            this.initialized = true;
            this.configuration.logger.verbose(`Supply ${this.id} synced`);

        }
        return this;

    }
}