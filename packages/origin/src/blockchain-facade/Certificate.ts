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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

import { TransactionReceipt, Log } from 'web3/types';
import { Configuration, Currency } from '@energyweb/utils-general';

import * as TradableEntity from './TradableEntity';
import { CertificateLogic } from '..';

export enum Status {
    Active,
    Retired,
    Split
}

export interface ICertificate extends TradableEntity.IOnChainProperties {
    status: number;
    dataLog: string;
    creationTime: number;
    parentId: number;
    children: number[];
    maxOwnerChanges: number;
    ownerChangerCounter: number;
}

export const getCertificateListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
    return parseInt(
        await configuration.blockchainProperties.certificateLogicInstance.getCertificateListLength(),
        10
    );
};

export const getAllCertificates = async (configuration: Configuration.Entity) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return Promise.all(certificatePromises);
};

export const getActiveCertificates = async (configuration: Configuration.Entity) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    const certs = await Promise.all(certificatePromises);

    return certs.filter((cert: Entity) => Number(cert.status) === Status.Active);
};

export const isRetired = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<boolean> => {
    return configuration.blockchainProperties.certificateLogicInstance.isRetired(certId);
};

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<Log[]> => {
    const allEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
        {
            topics: [
                null,
                configuration.blockchainProperties.web3.utils.padLeft(
                    configuration.blockchainProperties.web3.utils.fromDecimal(certId),
                    64,
                    '0'
                )
            ]
        }
    );

    const returnEvents = [];

    for (const fullEvent of allEvents) {
        // we have to remove some false positives due to ERC721 interface
        if (fullEvent.event === 'Transfer') {
            if (fullEvent.returnValues._tokenId === '' + certId) {
                returnEvents.push(fullEvent);
            }
        } else {
            returnEvents.push(fullEvent);
        }
    }

    // we also have to search
    if (certId !== 0) {
        const transferEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
            {
                topics: [
                    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                    null,
                    null,
                    configuration.blockchainProperties.web3.utils.padLeft(
                        configuration.blockchainProperties.web3.utils.fromDecimal(certId),
                        64,
                        '0'
                    )
                ]
            }
        );

        for (const transferEvent of transferEvents) {
            returnEvents.push(transferEvent);
        }
    }

    return returnEvents;
};

export class Entity extends TradableEntity.Entity implements ICertificate {
    status: number;
    dataLog: string;
    creationTime: number;
    parentId: number;
    children: number[];
    maxOwnerChanges: number;
    ownerChangerCounter: number;

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/Certificate`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const cert = await this.configuration.blockchainProperties.certificateLogicInstance.getCertificate(
                this.id
            );

            this.assetId = cert.tradableEntity.assetId;
            this.owner = cert.tradableEntity.owner;
            this.powerInW = Number(cert.tradableEntity.powerInW);
            this.forSale = cert.tradableEntity.forSale;
            this.acceptedToken = cert.tradableEntity.acceptedToken;
            this.onChainDirectPurchasePrice = cert.tradableEntity.onChainDirectPurchasePrice;
            this.escrow = cert.tradableEntity.escrow;
            this.approvedAddress = cert.tradableEntity.approvedAddress;

            this.children = cert.certificateSpecific.children;
            this.status = cert.certificateSpecific.status;
            this.dataLog = cert.certificateSpecific.dataLog;
            this.creationTime = cert.certificateSpecific.creationTime;
            this.parentId = cert.certificateSpecific.parentId;
            this.maxOwnerChanges = cert.certificateSpecific.maxOwnerChanges;
            this.ownerChangerCounter = cert.certificateSpecific.ownerChangeCounter;
            this.offChainSettlementOptions = await this.getOffChainSettlementOptions();

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Certificate ${this.id} synced`);
            }
        }

        return this;
    }

    async buyCertificate(wh?: number): Promise<TransactionReceipt> {
        const logic: CertificateLogic = this.configuration.blockchainProperties
            .certificateLogicInstance;
        const id: number = Number(this.id);

        if (wh) {
            let splitAndBuyCertificateCall;
            if (this.configuration.blockchainProperties.activeUser.privateKey) {
                splitAndBuyCertificateCall = logic.splitAndBuyCertificate(id, wh, {
                    privateKey: this.configuration.blockchainProperties.activeUser.privateKey
                });
            } else {
                splitAndBuyCertificateCall = logic.splitAndBuyCertificate(id, wh, {
                    from: this.configuration.blockchainProperties.activeUser.address,
                    privateKey: ''
                });
            }

            const txResult = await splitAndBuyCertificateCall;

            await this.sync();
            const offChainSettlementOptions = await this.getOffChainSettlementOptions();

            if (Number(this.status) === Status.Split) {
                for (const certificateId of this.children) {
                    const certificate = new Entity(certificateId.toString(), this.configuration);

                    await certificate.setOffChainSettlementOptions(offChainSettlementOptions);
                }
            }

            return txResult;
        }

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return logic.buyCertificate(id, {
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            });
        } else {
            return logic.buyCertificate(id, {
                from: this.configuration.blockchainProperties.activeUser.address,
                privateKey: ''
            });
        }
    }

    async retireCertificate(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async splitCertificate(power: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                power,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                power,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async publishForSale(
        price: number,
        tokenAddressOrCurrency: string | Currency,
        wh?: number
    ): Promise<void> {
        const isErc20Sale = this.configuration.blockchainProperties.web3.utils.isAddress(
            tokenAddressOrCurrency
        );
        const isFiatSale = Currency[tokenAddressOrCurrency] !== undefined;

        let certificate;

        if (!isErc20Sale && !isFiatSale) {
            throw Error('Please specify either an ERC20 token address or a currency.');
        }

        const certificateEnergy = Number(this.powerInW);
        const saleParams = {
            onChainPrice: isErc20Sale ? Math.floor(price) : 0,
            tokenAddress: isErc20Sale
                ? tokenAddressOrCurrency
                : '0x0000000000000000000000000000000000000000',
            offChainPrice: isFiatSale ? Math.floor(price * 100) : 0,
            offChainCurrency: isFiatSale ? tokenAddressOrCurrency : Currency.NONE
        };

        if (wh > certificateEnergy || wh <= 0) {
            throw Error(
                `Invalid energy request: Certificate ${this.id} has ${certificateEnergy} Wh, but user requested ${wh} Wh.`
            );
        }

        if (wh === undefined || wh === certificateEnergy) {
            await this.configuration.blockchainProperties.certificateLogicInstance.publishForSale(
                this.id,
                saleParams.onChainPrice,
                saleParams.tokenAddress,
                this.configuration.blockchainProperties.activeUser.privateKey
                    ? { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
                    : { from: this.configuration.blockchainProperties.activeUser.address }
            );

            certificate = await new Entity(this.id, this.configuration).sync();
        } else {
            await this.configuration.blockchainProperties.certificateLogicInstance.splitAndPublishForSale(
                this.id,
                wh,
                saleParams.onChainPrice,
                saleParams.tokenAddress,
                this.configuration.blockchainProperties.activeUser.privateKey
                    ? { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
                    : { from: this.configuration.blockchainProperties.activeUser.address }
            );

            await this.sync();

            certificate = await new Entity(this.children['0'], this.configuration).sync();
        }

        await certificate.setOffChainSettlementOptions({
            price: saleParams.offChainPrice,
            currency: saleParams.offChainCurrency
        });
    }

    async getCertificateOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
            this.id
        );
    }

    async isRetired(): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isRetired(this.id);
    }

    async getAllCertificateEvents(): Promise<Log[]> {
        const allEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
            {
                topics: [
                    null,
                    this.configuration.blockchainProperties.web3.utils.padLeft(
                        this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
                        64,
                        '0'
                    )
                ]
            }
        );

        const returnEvents = [];

        for (const fullEvent of allEvents) {
            // we have to remove some false positives due to ERC721 interface
            if (fullEvent.event === 'Transfer') {
                if (fullEvent.returnValues._tokenId === '' + this.id) {
                    returnEvents.push(fullEvent);
                }
            } else {
                returnEvents.push(fullEvent);
            }
        }

        // we also have to search
        if (this.id !== '0') {
            const transferEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
                {
                    topics: [
                        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                        null,
                        null,
                        this.configuration.blockchainProperties.web3.utils.padLeft(
                            this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
                            64,
                            '0'
                        )
                    ]
                }
            );

            for (const transferEvent of transferEvents) {
                returnEvents.push(transferEvent);
            }
        }

        return returnEvents;
    }
}
