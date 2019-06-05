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
import SupplyOffchainpropertiesSchema from '../../schemas/SupplyOffchainProperties.schema.json';

export interface ISupplyOffchainProperties {
    price: number;
    currency: GeneralLib.Currency;
    availableWh: number;
    timeframe: GeneralLib.TimeFrame;
}

export interface ISupplyOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    assetId: number;
}

export const getSupplyListLength = async (configuration: GeneralLib.Configuration.Entity) => {
    return configuration.blockchainProperties.marketLogicInstance.getAllSupplyListLength();
};

export const getAllSupplies = async (configuration: GeneralLib.Configuration.Entity) => {
    const suppliesPromises = Array(parseInt(await getSupplyListLength(configuration)))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return (await Promise.all(suppliesPromises)).filter(promise => promise.initialized);
};

export const createSupply = async (
    supplyPropertiesOnChain: ISupplyOnChainProperties,
    supplyPropertiesOffChain: ISupplyOffchainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const supply = new Entity(null, configuration);

    const offChainStorageProperties = supply.prepareEntityCreation(
        supplyPropertiesOnChain,
        supplyPropertiesOffChain,
        SupplyOffchainpropertiesSchema,
        supply.getUrl()
    );
    if (configuration.offChainDataSource) {
        supplyPropertiesOnChain.url = supply.getUrl();
        supplyPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createSupply(
        supplyPropertiesOnChain.propertiesDocumentHash,
        supplyPropertiesOnChain.url,
        supplyPropertiesOnChain.assetId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    supply.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await supply.putToOffChainStorage(supplyPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Supply ${supply.id} created`);
    }

    return supply.sync();
};

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity
    implements ISupplyOnChainProperties {
    offChainProperties: ISupplyOffchainProperties;
    propertiesDocumentHash: string;
    url: string;

    assetId: number;

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Supply`;
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
