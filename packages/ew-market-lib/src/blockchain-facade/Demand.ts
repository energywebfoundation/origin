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

export interface DemandOnChainProperties extends GeneralLib.BlockchainDataModelEntity.OnChainProperties {
    demandOwner: string;
}

export const getDemandListLength = async (configuration: GeneralLib.Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.marketLogicInstance.getAllDemandListLength(), 10);
};

export const createDemand =
    async (demandPropertiesOnChain: DemandOnChainProperties,
        configuration: GeneralLib.Configuration.Entity): Promise<Entity> => {
        const demand = new Entity(null, configuration);

        /*
        const offChainStorageProperties =
            demand.prepareEntityCreation(demandPropertiesOnChain, null, null);

        if (configuration.offChainDataSource) {
            demandPropertiesOnChain.url = demand.getUrl();
            demandPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
        }*/

        const tx = await configuration.blockchainProperties.marketLogicInstance.createDemand(
            demandPropertiesOnChain.propertiesDocumentHash,
            demandPropertiesOnChain.url,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            },
        );

        demand.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString();

        //    await demand.putToOffChainStorage(null, offChainStorageProperties);

        if (configuration.logger) {
            configuration.logger.info(`Demand ${demand.id} created`);
        }


        return demand.sync();

    };

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements DemandOnChainProperties {

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
        return `${this.configuration.offChainDataSource.baseUrl}/Demand`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const demand = await this.configuration.blockchainProperties.marketLogicInstance.getDemand(this.id);

            this.propertiesDocumentHash = demand._propertiesDocumentHash;
            this.url = demand._documentDBURL;
            this.demandOwner = demand._owner;
            this.initialized = true;
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Demand ${this.id} synced`);
            }


        }
        return this;

    }
}
