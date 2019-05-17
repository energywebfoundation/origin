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

import * as GeneralLib from 'ew-utils-general-lib';
import * as Asset from './Asset';
import { ProducingAssetPropertiesOffchainSchema } from '..';
import { TransactionReceipt } from 'web3/types';

/**
 * TODO: in generalLib
 */
export enum Type {
    Wind,
    Solar,
    RunRiverHydro,
    BiomassGas,
}

export enum Compliance {
    none,
    IREC,
    EEC,
    TIGR,
}

export interface OnChainProperties extends Asset.OnChainProperties {
    maxOwnerChanges?: number;
}

export interface OffChainProperties extends Asset.OffChainProperties {
    assetType: Type;
    complianceRegistry: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;

}

export const getAssetListLength = async (configuration: GeneralLib.Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.producingAssetLogicInstance.getAssetListLength(), 10);
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

export const createAsset =
    async (assetPropertiesOnChain: OnChainProperties,
           assetPropertiesOffChain: OffChainProperties,
           configuration: GeneralLib.Configuration.Entity): Promise<Entity> => {
        const producingAsset = new Entity(null, configuration);
        const offChainStorageProperties =
            producingAsset.prepareEntityCreation(assetPropertiesOnChain, assetPropertiesOffChain, ProducingAssetPropertiesOffchainSchema);

        if (configuration.offChainDataSource) {
            assetPropertiesOnChain.url = producingAsset.getUrl();
            assetPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
        }

        const tx = await configuration.blockchainProperties.producingAssetLogicInstance.createAsset(
            assetPropertiesOnChain.smartMeter.address,
            assetPropertiesOnChain.owner.address,
            assetPropertiesOnChain.active,
            assetPropertiesOnChain.matcher.map((matcher) => matcher.address),
            assetPropertiesOnChain.propertiesDocumentHash,
            assetPropertiesOnChain.url,
            assetPropertiesOnChain.maxOwnerChanges,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            },
        );

        producingAsset.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

        await producingAsset.putToOffChainStorage(assetPropertiesOffChain, offChainStorageProperties);

        if (configuration.logger) {
            configuration.logger.info(`Producing asset ${producingAsset.id} created`);
        }

        return producingAsset.sync();

    };

export class Entity extends Asset.Entity implements OnChainProperties {

    certificatesCreatedForWh: number;
    lastSmartMeterCO2OffsetRead: number;
    maxOwnerChanges: number;
    offChainProperties: OffChainProperties;

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/ProducingAsset`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {

            const asset = await this.configuration.blockchainProperties.producingAssetLogicInstance.getAssetById(this.id);

            this.smartMeter = { address: asset.assetGeneral.smartMeter };
            this.owner = { address: asset.assetGeneral.owner };
            this.lastSmartMeterReadWh = asset.assetGeneral.lastSmartMeterReadWh;
            this.active = asset.assetGeneral.active;
            this.lastSmartMeterReadFileHash = asset.assetGeneral.lastSmartMeterReadFileHash;
            this.matcher = [{ address: asset.assetGeneral.matcher }];
            this.propertiesDocumentHash = asset.assetGeneral.propertiesDocumentHash;
            this.url = asset.assetGeneral.url;
            this.initialized = true;
            this.maxOwnerChanges = asset.maxOwnerChanges;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Producing asset ${this.id} synced`);
            }

        }

        return this;
    }

    async saveSmartMeterRead(meterReading: number, filehash: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey },
            );
        }
        else {
            return this.configuration.blockchainProperties.producingAssetLogicInstance.saveSmartMeterRead(
                this.id,
                meterReading,
                filehash,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

}
