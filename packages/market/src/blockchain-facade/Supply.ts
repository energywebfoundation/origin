import * as GeneralLib from '@energyweb/utils-general';

import supplyOffChainPropertiesSchema from '../../schemas/SupplyOffChainProperties.schema.json';

export interface ISupplyOffChainProperties {
    price: number;
    currency: GeneralLib.Currency;
    availableWh: number;
    timeFrame: GeneralLib.TimeFrame;
}

export interface ISupplyOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    assetId: string;
}

export interface ISupply extends ISupplyOnChainProperties {
    offChainProperties: ISupplyOffChainProperties;
}

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements ISupply {
    offChainProperties: ISupplyOffChainProperties;

    propertiesDocumentHash: string;

    url: string;

    assetId: string;

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
            const demand = await this.configuration.blockchainProperties.marketLogicInstance.getSupply(
                this.id
            );

            this.propertiesDocumentHash = demand._propertiesDocumentHash;
            this.url = demand._documentDBURL;
            this.assetId = demand._assetId;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Supply ${this.id} synced`);
            }
        }

        return this;
    }
}

export const getSupplyListLength = async (configuration: GeneralLib.Configuration.Entity) => {
    return configuration.blockchainProperties.marketLogicInstance.getAllSupplyListLength();
};

export const getAllSupplies = async (configuration: GeneralLib.Configuration.Entity) => {
    const suppliesPromises = Array(parseInt(await getSupplyListLength(configuration), 10))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return (await Promise.all(suppliesPromises)).filter(promise => promise.initialized);
};

export const createSupply = async (
    supplyPropertiesOnChain: ISupplyOnChainProperties,
    supplyPropertiesOffChain: ISupplyOffChainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const supply = new Entity(null, configuration);

    const offChainStorageProperties = supply.prepareEntityCreation(
        supplyPropertiesOffChain,
        supplyOffChainPropertiesSchema,
        supply.getUrl()
    );

    let { url, propertiesDocumentHash } = supplyPropertiesOnChain;

    if (configuration.offChainDataSource) {
        url = supply.getUrl();
        propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createSupply(
        propertiesDocumentHash,
        url,
        supplyPropertiesOnChain.assetId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    supply.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await supply.putToOffChainStorage(supplyPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Supply ${supply.id} created`);
    }

    return supply.sync();
};
