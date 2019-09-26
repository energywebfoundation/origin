import { Configuration } from '@energyweb/utils-general';
import * as Asset from './Asset';
import { AssetPropertiesOffchainSchema } from '..';
import { TransactionReceipt } from 'web3/types';
import moment from 'moment';

export interface IOnChainProperties extends Asset.IOnChainProperties {
    certificatesUsedForWh: number;
}

export const createAsset = async (
    assetProperties: IOnChainProperties,
    assetPropertiesOffChain: Asset.IOffChainProperties,
    configuration: Configuration.Entity
): Promise<Asset.Entity> => {
    const consumingAsset = new Entity(null, configuration);
    const offChainStorageProperties = consumingAsset.prepareEntityCreation(
        assetPropertiesOffChain,
        AssetPropertiesOffchainSchema
    );

    if (configuration.offChainDataSource) {
        assetProperties.url = consumingAsset.getUrl();
        assetProperties.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.consumingAssetLogicInstance.createAsset(
        assetProperties.smartMeter.address,
        assetProperties.owner.address,
        assetProperties.active,
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

    await consumingAsset.putToOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Consuming asset ${consumingAsset.id} created`);
    }

    return consumingAsset.sync();
};

export const getAssetListLength = async (configuration: Configuration.Entity) => {
    return parseInt(
        await configuration.blockchainProperties.consumingAssetLogicInstance.getAssetListLength(),
        10
    );
};

export const getAllAssets = async (configuration: Configuration.Entity) => {
    const assetsPromises = Array(await getAssetListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return Promise.all(assetsPromises);
};

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration)).filter(
        (asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase()
    );
};

export class Entity extends Asset.Entity implements Asset.IOnChainProperties {
    getUrl(): string {
        const consumingAssetLogicAddress = this.configuration.blockchainProperties.consumingAssetLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/ConsumingAsset/${consumingAssetLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        const asset = await this.configuration.blockchainProperties.consumingAssetLogicInstance.getAssetById(
            this.id
        );

        if (this.id != null) {
            this.smartMeter = { address: asset.assetGeneral.smartMeter };
            this.owner = { address: asset.assetGeneral.owner };
            this.lastSmartMeterReadWh = asset.assetGeneral.lastSmartMeterReadWh;
            this.active = asset.assetGeneral.active;
            this.lastSmartMeterReadFileHash = asset.assetGeneral.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = asset.assetGeneral.propertiesDocumentHash;
            this.url = asset.assetGeneral.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Consuming asset ${this.id} synced`);
            }
        }

        return this;
    }

    async saveSmartMeterRead(
        newMeterReading: number,
        fileHash: string,
        timestamp: number = moment().unix()
    ): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.consumingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                newMeterReading,
                fileHash,
                timestamp,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.consumingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                newMeterReading,
                fileHash,
                timestamp,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }
}
