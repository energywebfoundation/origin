import { Compliance, Configuration } from '@energyweb/utils-general';
import moment from 'moment';
import { TransactionReceipt } from 'web3/types';

import { ProducingAssetPropertiesOffChainSchema } from '..';
import { AssetLogic } from '../wrappedContracts/AssetLogic';
import * as Asset from './Asset';

export interface IOffChainProperties extends Asset.IOffChainProperties {
    assetType: string;
    complianceRegistry: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
}

export const getAssetListLength = async (configuration: Configuration.Entity) => {
    return parseInt(
        await configuration.blockchainProperties.producingAssetLogicInstance.getAssetListLength(),
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

    if (configuration.offChainDataSource) {
        assetPropertiesOnChain.url = producingAsset.getUrl();
        assetPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.producingAssetLogicInstance.createAsset(
        assetPropertiesOnChain.smartMeter.address,
        assetPropertiesOnChain.owner.address,
        assetPropertiesOnChain.active,
        assetPropertiesOnChain.propertiesDocumentHash,
        assetPropertiesOnChain.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    producingAsset.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await producingAsset.syncOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Producing asset ${producingAsset.id} created`);
    }

    return producingAsset.sync();
};

export interface ISmartMeterRead {
    energy: number;
    timestamp: number;
}

export interface IProducingAsset extends Asset.IOnChainProperties {
    offChainProperties: IOffChainProperties
}

export class Entity extends Asset.Entity implements IProducingAsset {
    certificatesCreatedForWh: number;
    lastSmartMeterCO2OffsetRead: number;
    offChainProperties: IOffChainProperties;

    getUrl(): string {
        const producingAssetLogicAddress = this.configuration.blockchainProperties
            .producingAssetLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/ProducingAsset/${producingAssetLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const asset = await this.configuration.blockchainProperties.producingAssetLogicInstance.getAssetById(
                this.id
            );

            this.smartMeter = { address: asset.smartMeter };
            this.owner = { address: asset.owner };
            this.lastSmartMeterReadWh = asset.lastSmartMeterReadWh;
            this.active = asset.active;
            this.lastSmartMeterReadFileHash = asset.lastSmartMeterReadFileHash;
            this.propertiesDocumentHash = asset.propertiesDocumentHash;
            this.url = asset.url;
            this.initialized = true;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing asset ${this.id} synced`);
            }
        }

        return this;
    }

    async saveSmartMeterRead(
        meterReading: number,
        filehash: string,
        timestamp: number = moment().unix()
    ): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                timestamp,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                timestamp,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getSmartMeterReads(): Promise<ISmartMeterRead[]> {
        const logic: AssetLogic = this.configuration.blockchainProperties
            .producingAssetLogicInstance;

        return (await logic.getSmartMeterReadsForAsset(Number(this.id))).map((read: ISmartMeterRead) => ({
            energy: Number(read.energy),
            timestamp: Number(read.timestamp)
        }));
    }
}
