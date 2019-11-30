import polly from 'polly-js';

import { Compliance, Configuration } from '@energyweb/utils-general';

import { ProducingAssetPropertiesOffChainSchema } from '..';
import * as Asset from './Asset';

export interface IOffChainProperties extends Asset.IOffChainProperties {
    assetType: string;
    complianceRegistry: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
}

export const getAllAssets = async (configuration: Configuration.Entity): Promise<Entity[]> => {
    const assetLogicInstance = configuration.blockchainProperties.assetLogicInstance;
    const assetListLength = parseInt(await assetLogicInstance.getAssetListLength(), 10);

    const assetsPromises = Array(assetListLength).fill(null).map(async (item, index) => {
        return {
            id: index,
            asset: await assetLogicInstance.getAsset(index)
        };
    });
    
    const allAssets = await Promise.all(assetsPromises);

    const producingAssets = allAssets.filter((asset, index) => Number(asset.asset.usageType) === Asset.UsageType.Producing);
    const producingAssetsSynced = producingAssets.map(asset => new Entity(asset.id.toString(), configuration).sync());
    
    return Promise.all(producingAssetsSynced);
};

export const getAssetListLength = async (configuration: Configuration.Entity) => {
    const producingAssets = await getAllAssets(configuration);
    return producingAssets.length;
};

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration)).filter(
        (asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase()
    );
};

export const createAsset = async (
    assetPropertiesOnChain: Asset.IOnChainProperties,
    assetPropertiesOffChain: IOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const producingAsset = new Entity(null, configuration);
    const offChainStorageProperties = producingAsset.prepareEntityCreation(
        assetPropertiesOffChain,
        ProducingAssetPropertiesOffChainSchema
    );

    assetPropertiesOnChain.url = producingAsset.getUrl();
    assetPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;

    await polly()
        .waitAndRetry(10)
        .executeForPromise(async () => {
            producingAsset.id = (await getAssetListLength(configuration)).toString();
            await producingAsset.throwIfExists();
        });

    await producingAsset.syncOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateAsset,
        logs
    } = await configuration.blockchainProperties.assetLogicInstance.createAsset(
        assetPropertiesOnChain.smartMeter.address,
        assetPropertiesOnChain.owner.address,
        assetPropertiesOnChain.active,
        Asset.UsageType.Producing,
        assetPropertiesOnChain.propertiesDocumentHash,
        assetPropertiesOnChain.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    if (!successCreateAsset) {
        await producingAsset.deleteFromOffChainStorage();
        throw new Error('createAsset: Saving on-chain data failed. Reverting...');
    }

    const idFromTx = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[1])
        .toString();

    if (producingAsset.id !== idFromTx) {
        producingAsset.id = idFromTx;
        await producingAsset.syncOffChainStorage(assetPropertiesOffChain, offChainStorageProperties)
    }

    if (configuration.logger) {
        configuration.logger.info(`Producing asset ${producingAsset.id} created`);
    }

    return producingAsset.sync();
};
export interface IProducingAsset extends Asset.IOnChainProperties {
    offChainProperties: IOffChainProperties
}

export class Entity extends Asset.Entity implements IProducingAsset {
    offChainProperties: IOffChainProperties;

    getUrl(): string {
        const producingAssetLogicAddress = this.configuration.blockchainProperties
            .assetLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/ProducingAsset/${producingAssetLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const asset = await this.configuration.blockchainProperties.assetLogicInstance.getAssetById(
                this.id
            );

            this.smartMeter = { address: asset.smartMeter };
            this.owner = { address: asset.owner };
            this.lastSmartMeterReadWh = Number(asset.lastSmartMeterReadWh);
            this.active = asset.active;
            this.usageType = Number(asset.usageType);
            this.lastSmartMeterReadFileHash = asset.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = asset.propertiesDocumentHash;
            this.url = asset.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties();
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing asset ${this.id} synced`);
            }
        }

        return this;
    }
}
