import * as GeneralLib from 'ew-utils-general-lib';
import * as Asset from './Asset';
import { AssetPropertiesOffchainSchema } from '..';
import { TransactionReceipt } from 'web3/types';

export interface OnChainProperties extends Asset.OnChainProperties {
    // GeneralInformation
    certificatesUsedForWh: number;

}

export const createAsset =
    async (assetProperties: OnChainProperties,
           assetPropertiesOffChain: Asset.OffChainProperties,
           configuration: GeneralLib.Configuration.Entity): Promise<Asset.Entity> => {
        const consumingAsset = new Entity(null, configuration);
        const offChainStorageProperties =
            consumingAsset.prepareEntityCreation(assetProperties, assetPropertiesOffChain, AssetPropertiesOffchainSchema, false);

        if (configuration.offChainDataSource) {
            assetProperties.url = consumingAsset.getUrl();
            assetProperties.propertiesDocumentHash = offChainStorageProperties.rootHash;
        }

        const tx = await configuration.blockchainProperties.consumingAssetLogicInstance.createAsset(
            assetProperties.smartMeter.address,
            assetProperties.owner.address,
            assetProperties.active,
            assetProperties.matcher.map((matcher) => matcher.address),
            assetProperties.propertiesDocumentHash,
            assetProperties.url,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            });

        consumingAsset.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

        await consumingAsset.putToOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

        if (configuration.logger) {
            configuration.logger.info(`Consuming asset ${consumingAsset.id} created`);
        }

        return consumingAsset.sync();

    };

export const getAssetListLength = async (configuration: GeneralLib.Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.consumingAssetLogicInstance.getAssetListLength(), 10);
};

export const getAllAssets = async (configuration: GeneralLib.Configuration.Entity) => {

    const assetsPromises = Array(await getAssetListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return Promise.all(assetsPromises);

};

export const getAllAssetsOwnedBy = async (owner: string, configuration: GeneralLib.Configuration.Entity) => {
    return (await getAllAssets(configuration))
        .filter((asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase());
};

export class Entity extends Asset.Entity implements OnChainProperties {

    getUrl(): string {

        return `${this.configuration.offChainDataSource.baseUrl}/ConsumingAsset`;
    }

    async sync(): Promise<Entity> {
        const asset = await this.configuration.blockchainProperties.consumingAssetLogicInstance.getAssetById(this.id);

        if (this.id != null) {
            this.smartMeter = { address: asset.assetGeneral.smartMeter };
            this.owner = { address: asset.assetGeneral.owner };
            this.lastSmartMeterReadWh = asset.assetGeneral.lastSmartMeterReadWh;
            this.active = asset.assetGeneral.active;
            this.lastSmartMeterReadFileHash = asset.assetGeneral.lastSmartMeterReadFileHash;
            this.matcher = [{ address: asset.assetGeneral.matcher }];
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

    async saveSmartMeterRead(newMeterReading: number, fileHash: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.consumingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                newMeterReading,
                fileHash,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey },
            );
        }
        else {
            return this.configuration.blockchainProperties.consumingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                newMeterReading,
                fileHash,
                { privateKey: this.configuration.blockchainProperties.activeUser.address },
            );
        }

    }

} 
