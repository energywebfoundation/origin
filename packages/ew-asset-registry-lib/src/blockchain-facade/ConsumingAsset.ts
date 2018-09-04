import * as Configuration from '../Configuration';

import * as AssetOffChainPropertiesSchema from '../../../schemas/AssetPropertiesOffChain.schema.json';
import { Asset } from '..';

export interface OnChainProperties extends Asset.OnChainProperties {
    // GeneralInformation
    certificatesUsedForWh: number;

}

export const createAsset = async (

        assetProperties: OnChainProperties,
        assetPropertiesOffChain: Asset.OffChainProperties,
        configuration: Configuration.Entity
    ): Promise<Asset.Entity> => {
    const consoumingAsset = new Entity(null, configuration);
    const offChainStorageProperties = consoumingAsset.prepareEntityCreation(assetProperties, assetPropertiesOffChain, AssetOffChainPropertiesSchema);
        Asset 
    if (configuration.offChainDataSource) {
        assetProperties.url = consoumingAsset.getUrl();
        assetProperties.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.consumingAssetLogicInstance.createAsset(
        assetProperties.smartMeter.address,
        assetProperties.owner.address,
        assetProperties.active,
        assetProperties.matcher[0].address,
        assetProperties.propertiesDocumentHash,
        assetProperties.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey,
        });

    consoumingAsset.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

    await consoumingAsset.putToOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

    configuration.logger.info(`Consuming asset ${consoumingAsset.id} created`);
    return consoumingAsset.sync();

};

export const getAssetListLength = async (configuration: Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.consumingAssetLogicInstance.getAssetListLength(), 10);
};

export const  getAllAssets = async (configuration: Configuration.Entity) => {

    const assetsPromises = Array(await getAssetListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return Promise.all(assetsPromises);

};

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration))
        .filter((asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase());
};

export class Entity extends Asset.Entity implements OnChainProperties {

    getUrl(): string {

        return `${this.configuration.offChainDataSource.baseUrl}/ConsumingAsset`;
    }

    async sync(): Promise<Entity> {
        const asset = await this.configuration.blockchainProperties.consumingAssetLogicInstance.getAsset(this.id);

        if (this.id != null) {
            this.certificatesUsedForWh = asset._certificatesUsedForWh;
            this.smartMeter = { address: asset._smartMeter };
            this.owner = { address: asset._owner };
            this.lastSmartMeterReadWh = asset._lastSmartMeterReadWh;
            this.active = asset._active;
            this.lastSmartMeterReadFileHash = asset._lastSmartMeterReadFileHash;
            this.matcher = [{ address: asset._matcher }];
            this.propertiesDocumentHash = asset._propertiesDocumentHash;
            this.url = asset._url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            this.configuration.logger.verbose(`Consuming asset ${this.id} synced`);
        }

        return this;
    }

} 
