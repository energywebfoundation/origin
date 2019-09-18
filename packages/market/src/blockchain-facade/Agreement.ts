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

import * as GeneralLib from '@energyweb/utils-general';
import AgreementOffchainPropertiesSchema from '../../schemas/AgreementOffChainProperties.schema.json';
import { TransactionReceipt } from 'web3/types';

export interface IAgreementOffChainProperties {
    start: number;
    end: number;
    price: number;
    currency: GeneralLib.Currency;
    period: number;
    timeframe: GeneralLib.TimeFrame;
}


export interface IAgreementOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    demandId: string;
    supplyId: string;
}

export const createAgreement = async (
    agreementPropertiesOnChain: IAgreementOnChainProperties,
    agreementPropertiesOffchain: IAgreementOffChainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const agreementOffChainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOffchain,
        AgreementOffchainPropertiesSchema,
        agreement.getUrl()
    );

    if (configuration.offChainDataSource) {
        agreementPropertiesOnChain.url = agreement.getUrl();
        agreementPropertiesOnChain.propertiesDocumentHash =
            agreementOffChainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createAgreement(
        agreementPropertiesOnChain.propertiesDocumentHash,
        agreementPropertiesOnChain.url,
        agreementPropertiesOnChain.demandId,
        agreementPropertiesOnChain.supplyId,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    agreement.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await agreement.putToOffChainStorage(
        agreementPropertiesOffchain,
        agreementOffChainStorageProperties
    );

    if (configuration.logger) {
        configuration.logger.info(`Agreement ${agreement.id} created`);
    }

    return agreement.sync();
};

export const getAgreementListLength = async (
    configuration: GeneralLib.Configuration.Entity
): Promise<number> => {
    return Number(
        await configuration.blockchainProperties.marketLogicInstance.getAllAgreementListLength()
    );
};

export const getAllAgreements = async (configuration: GeneralLib.Configuration.Entity) => {
    const agreementsPromises = Array(await getAgreementListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return (await Promise.all(agreementsPromises)).filter(promise => promise.initialized);
};

export interface IAgreement extends IAgreementOnChainProperties {
    offChainProperties: IAgreementOffChainProperties;
}

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity
    implements IAgreement {
    offChainProperties: IAgreementOffChainProperties;
    propertiesDocumentHash: string;
    url: string;
    demandId: string;
    supplyId: string;
    approvedBySupplyOwner: boolean;
    approvedByDemandOwner: boolean;

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);
        this.initialized = false;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Agreement`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const agreement = await this.configuration.blockchainProperties.marketLogicInstance.getAgreement(
                this.id
            );

            this.propertiesDocumentHash = agreement._propertiesDocumentHash;
            this.url = agreement._documentDBURL;
            this.demandId = agreement._demandId;
            this.supplyId = agreement._supplyId;
            this.approvedBySupplyOwner = agreement._approvedBySupplyOwner;
            this.approvedByDemandOwner = agreement._approvedByDemandOwner;
            this.offChainProperties = await this.getOffChainProperties(
                this.propertiesDocumentHash,
                this.getUrl()
            );

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Agreement with ${this.id} synced`);
            }

            this.initialized = true;
        }

        return this;
    }

    async approveAgreementDemand(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementDemand(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementDemand(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async approveAgreementSupply(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementSupply(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.marketLogicInstance.approveAgreementSupply(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }
}
