// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import { Configuration } from 'ew-utils-general-lib';
import * as Asset from './Asset';
import { AssetPropertiesOffchainSchema } from '..';
import { TransactionReceipt } from 'web3/types';
import moment from 'moment';

export interface IOnChainProperties extends Asset.IOnChainProperties {
    certificatesUsedForWh: number;
}

export const createAsset =
    async (assetProperties: IOnChainProperties,
           assetPropertiesOffChain: Asset.IOffChainProperties,
           configuration: Configuration.Entity): Promise<Asset.Entity> => {
        const consumingAsset = new Entity(null, configuration);
        const offChainStorageProperties =
            consumingAsset.prepareEntityCreation(assetProperties, assetPropertiesOffChain, AssetPropertiesOffchainSchema);

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

export const getAssetListLength = async (configuration: Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.consumingAssetLogicInstance.getAssetListLength(), 10);
};

export const getAllAssets = async (configuration: Configuration.Entity) => {

    const assetsPromises = Array(await getAssetListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return Promise.all(assetsPromises);

};

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration))
        .filter((asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase());
};

export class Entity extends Asset.Entity implements Asset.IOnChainProperties {

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
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey },
            );
        }
        else {
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
