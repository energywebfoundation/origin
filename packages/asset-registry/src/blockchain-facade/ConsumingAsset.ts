import { Configuration } from '@energyweb/utils-general';
import * as Asset from './Asset';
import { AssetPropertiesOffChainSchema } from '..';

export const createAsset = async (
    assetProperties: Asset.IOnChainProperties,
    assetPropertiesOffChain: Asset.IOffChainProperties,
    configuration: Configuration.Entity
): Promise<Asset.Entity> => {
    const consumingAsset = new Entity(null, configuration);
    const offChainStorageProperties = consumingAsset.prepareEntityCreation(
        assetPropertiesOffChain,
        AssetPropertiesOffChainSchema
    );

    if (configuration.offChainDataSource) {
        assetProperties.url = consumingAsset.getUrl();
        assetProperties.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.assetLogicInstance.createAsset(
        assetProperties.smartMeter.address,
        assetProperties.owner.address,
        assetProperties.active,
        Asset.UsageType.Consuming,
        assetProperties.propertiesDocumentHash,
        assetProperties.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    consumingAsset.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await consumingAsset.syncOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Consuming asset ${consumingAsset.id} created`);
    }

    return consumingAsset.sync();
};

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

    const consumingAssets = allAssets.filter((asset, index) => Number(asset.asset.usageType) === Asset.UsageType.Consuming);
    const consumingAssetsSynced = consumingAssets.map(asset => new Entity(asset.id.toString(), configuration).sync());
    
    return Promise.all(consumingAssetsSynced);
};

export const getAssetListLength = async (configuration: Configuration.Entity) => {
    const consumingAssets = await getAllAssets(configuration);
    return consumingAssets.length;
};

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration)).filter(
        (asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase()
    );
};

export interface IConsumingAsset extends Asset.IOnChainProperties {
    offChainProperties: Asset.IOffChainProperties
}

export class Entity extends Asset.Entity implements IConsumingAsset {
    offChainProperties: Asset.IOffChainProperties;

    getUrl(): string {
        const consumingAssetLogicAddress = this.configuration.blockchainProperties.assetLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/ConsumingAsset/${consumingAssetLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        const asset = await this.configuration.blockchainProperties.assetLogicInstance.getAssetById(
            this.id
        );

        if (this.id != null) {
            this.smartMeter = { address: asset.smartMeter };
            this.owner = { address: asset.owner };
            this.lastSmartMeterReadWh = Number(asset.lastSmartMeterReadWh);
            this.active = asset.active;
            this.usageType = Number(asset.usageType);
            this.lastSmartMeterReadFileHash = asset.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = asset.propertiesDocumentHash;
            this.url = asset.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Consuming asset ${this.id} synced`);
            }
        }

        return this;
    }
}
