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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

import * as GeneralLib from 'ew-utils-general-lib';
import DemandOffChainPropertiesSchema from '../../schemas/DemandOffChainProperties.schema.json';

export interface IDemandOffChainProperties {
    timeframe: GeneralLib.TimeFrame;
    pricePerCertifiedWh: number;
    currency: GeneralLib.Currency;
    productingAsset?: number;
    consumingAsset?: number;
    locationCountry?: string;
    locationRegion?: string;
    assettype?: GeneralLib.AssetType;
    minCO2Offset?: number;
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
    targetWhPerPeriod: number;
    registryCompliance?: GeneralLib.Compliance;
}

export interface IDemandOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    demandOwner: string;
}

export const getDemandListLength = async (
    configuration: GeneralLib.Configuration.Entity
): Promise<number> => {
    return configuration.blockchainProperties.marketLogicInstance.getAllDemandListLength();
};

export const createDemand = async (
    demandPropertiesOnChain: IDemandOnChainProperties,
    demandPropertiesOffChain: IDemandOffChainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const demand = new Entity(null, configuration);

    const offChainStorageProperties = demand.prepareEntityCreation(
        demandPropertiesOnChain,
        demandPropertiesOffChain,
        DemandOffChainPropertiesSchema,
        demand.getUrl()
    );

    if (configuration.offChainDataSource) {
        demandPropertiesOnChain.url = demand.getUrl();
        demandPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createDemand(
        demandPropertiesOnChain.propertiesDocumentHash,
        demandPropertiesOnChain.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    demand.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await demand.putToOffChainStorage(demandPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demand.id} created`);
    }

    return demand.sync();
};

export const deleteDemand = async (
    demandId: number,
    configuration: GeneralLib.Configuration.Entity
): Promise<boolean> => {
    let success = true;

    const demand = await (new Entity(demandId.toString(), configuration)).sync();

    try {
        await configuration.blockchainProperties.marketLogicInstance.deleteDemand(
            demandId,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey
            }
            );
        await demand.deleteFromOffChainStorage();
    } catch (e) {
        success = false;
        throw e;
    }

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demandId} deleted`);
    }

    return success;
};

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity
    implements IDemandOnChainProperties {
    offChainProperties: IDemandOffChainProperties;
    propertiesDocumentHash: string;
    url: string;

    demandOwner: string;

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        const marketLogicAddress = this.configuration.blockchainProperties.marketLogicInstance.web3Contract._address;

        return `${this.configuration.offChainDataSource.baseUrl}/Demand/${marketLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const demand = await this.configuration.blockchainProperties.marketLogicInstance.getDemand(
                this.id
            );

            if (demand._owner === '0x0000000000000000000000000000000000000000') {
                return this;
            }

            this.propertiesDocumentHash = demand._propertiesDocumentHash;
            this.url = demand._documentDBURL;
            this.demandOwner = demand._owner;
            this.initialized = true;
            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Demand ${this.id} synced`);
            }
        }

        return this;
    }
}

export const getAllDemandsListLength = async (configuration: GeneralLib.Configuration.Entity) => {
    return parseInt(await configuration.blockchainProperties.marketLogicInstance.getAllDemandListLength(), 10);
};

export const getAllDemands = async (configuration: GeneralLib.Configuration.Entity) => {
    const assetsPromises = Array(await getAllDemandsListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return (await Promise.all(assetsPromises)).filter(promise => promise.initialized);
};
