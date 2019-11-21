import polly from 'polly-js';

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
        const marketLogicAddress = this.configuration.blockchainProperties.marketLogicInstance
            .web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/Supply/${marketLogicAddress}`;
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
        supplyOffChainPropertiesSchema
    );

    let { url, propertiesDocumentHash } = supplyPropertiesOnChain;

    url = supply.getUrl();
    propertiesDocumentHash = offChainStorageProperties.rootHash;

    await polly()
        .waitAndRetry(10)
        .executeForPromise(async () => {
            supply.id = (await getSupplyListLength(configuration)).toString();
            await supply.throwIfExists();
        });

    await supply.syncOffChainStorage(supplyPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateSupply,
        logs
    } = await configuration.blockchainProperties.marketLogicInstance.createSupply(
        propertiesDocumentHash,
        url,
        supplyPropertiesOnChain.assetId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    if (!successCreateSupply) {
        await supply.deleteFromOffChainStorage();
        throw new Error('createSupply: Saving on-chain data failed. Reverting...');
    }

    const idFromTx = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[1])
        .toString();

    if (supply.id !== idFromTx) {
        await supply.deleteFromOffChainStorage();

        supply.id = idFromTx;
        await supply.syncOffChainStorage(supplyPropertiesOffChain, offChainStorageProperties);
    }

    if (configuration.logger) {
        configuration.logger.info(`Supply ${supply.id} created`);
    }

    return supply.sync();
};
