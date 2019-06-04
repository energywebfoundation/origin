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
import AgreementOffchainPropertiesSchema from '../../schemas/AgreementOffChainProperties.schema.json';
import MatcherOffChainPropertiesSchema from '../../schemas/MatcherOffChainProperties.schema.json';
import { TransactionReceipt } from 'web3/types';

export interface IAgreementOffChainProperties {
    start: number;
    end: number;
    price: number;
    currency: GeneralLib.Currency;
    period: number;
    timeframe: GeneralLib.TimeFrame;
}

export interface IMatcherOffChainProperties {
    currentWh: number;
    currentPeriod: number;
}

export interface IAgreementOnChainProperties
    extends GeneralLib.BlockchainDataModelEntity.IOnChainProperties {
    matcherPropertiesDocumentHash: string;
    matcherDBURL: string;
    demandId: number;
    supplyId: number;
    allowedMatcher: string[];
}

export const createAgreement = async (
    agreementPropertiesOnChain: IAgreementOnChainProperties,
    agreementPropertiesOffchain: IAgreementOffChainProperties,
    matcherPropertiesOffchain: IMatcherOffChainProperties,
    configuration: GeneralLib.Configuration.Entity
): Promise<Entity> => {
    const agreement = new Entity(null, configuration);

    const agreementOffChainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOnChain,
        agreementPropertiesOffchain,
        AgreementOffchainPropertiesSchema,
        agreement.getUrl()
    );

    const matcherOffchainStorageProperties = agreement.prepareEntityCreation(
        agreementPropertiesOnChain,
        matcherPropertiesOffchain,
        MatcherOffChainPropertiesSchema,
        agreement.getMatcherURL()
    );

    if (configuration.offChainDataSource) {
        agreementPropertiesOnChain.url = agreement.getUrl();
        agreementPropertiesOnChain.propertiesDocumentHash =
            agreementOffChainStorageProperties.rootHash;

        agreementPropertiesOnChain.matcherDBURL = agreement.getMatcherURL();
        agreementPropertiesOnChain.matcherPropertiesDocumentHash =
            matcherOffchainStorageProperties.rootHash;
    }

    const tx = await configuration.blockchainProperties.marketLogicInstance.createAgreement(
        agreementPropertiesOnChain.propertiesDocumentHash,
        agreementPropertiesOnChain.url,
        agreementPropertiesOnChain.matcherPropertiesDocumentHash,
        agreementPropertiesOnChain.matcherDBURL,
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
    await agreement.putToOffChainStorage(
        matcherPropertiesOffchain,
        matcherOffchainStorageProperties,
        agreement.getMatcherURL()
    );

    if (configuration.logger) {
        configuration.logger.info(`Agreement ${agreement.id} created`);
    }

    return agreement.sync();
};

export const getAgreementListLength = async (
    configuration: GeneralLib.Configuration.Entity
): Promise<number> => {
    return configuration.blockchainProperties.marketLogicInstance.getAllAgreementListLength();
};

export class Entity extends GeneralLib.BlockchainDataModelEntity.Entity
    implements IAgreementOnChainProperties {
    matcherOffChainProperties: IMatcherOffChainProperties;
    offChainProperties: IAgreementOffChainProperties;
    propertiesDocumentHash: string;
    url: string;
    matcherPropertiesDocumentHash: string;
    matcherDBURL: string;
    demandId: number;
    supplyId: number;
    approvedBySupplyOwner: boolean;
    approvedByDemandOwner: boolean;
    allowedMatcher: string[];

    initialized: boolean;
    configuration: GeneralLib.Configuration.Entity;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);
        this.initialized = true;
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Agreement`;
    }

    getMatcherURL(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Matcher`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const agreement = await this.configuration.blockchainProperties.marketLogicInstance.getAgreement(
                this.id
            );

            this.propertiesDocumentHash = agreement._propertiesDocumentHash;
            this.url = agreement._documentDBURL;
            this.matcherPropertiesDocumentHash = agreement._matcherPropertiesDocumentHash;
            this.matcherDBURL = agreement._matcherDBURL;
            this.demandId = agreement._demandId;
            this.supplyId = agreement._supplyId;
            this.approvedBySupplyOwner = agreement._approvedBySupplyOwner;
            this.approvedByDemandOwner = agreement._approvedByDemandOwner;
            this.allowedMatcher = agreement._allowedMatcher;
            this.offChainProperties = await this.getOffChainProperties(
                this.propertiesDocumentHash,
                this.getUrl()
            );

            this.matcherOffChainProperties = await this.getOffChainProperties(
                this.matcherPropertiesDocumentHash,
                this.getMatcherURL()
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

    async setMatcherProperties(
        matcherOffchainProperties: IMatcherOffChainProperties
    ): Promise<TransactionReceipt> {
        const agreementPropsOnChain: IAgreementOnChainProperties = {
            matcherPropertiesDocumentHash: null,
            matcherDBURL: null,
            demandId: this.demandId,
            supplyId: this.supplyId,
            allowedMatcher: this.allowedMatcher,
            propertiesDocumentHash: null,
            url: null
        };

        const matcherOffchainStorageProperties = this.prepareEntityCreation(
            agreementPropsOnChain,
            matcherOffchainProperties,
            MatcherOffChainPropertiesSchema,
            this.getMatcherURL()
        );

        let tx;

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            tx = await this.configuration.blockchainProperties.marketLogicInstance.setMatcherProperties(
                this.id,
                matcherOffchainStorageProperties.rootHash,
                this.matcherDBURL,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            tx = await this.configuration.blockchainProperties.marketLogicInstance.setMatcherProperties(
                this.id,
                matcherOffchainStorageProperties.rootHash,
                this.matcherDBURL,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }

        await this.putToOffChainStorage(
            matcherOffchainProperties,
            matcherOffchainStorageProperties,
            this.getMatcherURL()
        );

        return tx;
    }
}
