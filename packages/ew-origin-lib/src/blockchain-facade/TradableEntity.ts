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

import axios from 'axios';

import { Configuration, BlockchainDataModelEntity, Currency } from 'ew-utils-general-lib';
import { TransactionReceipt } from 'web3/types';

export interface IOnChainProperties {
    assetId: number;
    owner: string;
    powerInW: number;
    forSale: boolean;
    acceptedToken?: number;
    onChainDirectPurchasePrice: number;
    offChainSettlementOptions: IOffChainSettlementOptions;
    escrow: string[];
    approvedAddress: string;
}

export interface IOffChainSettlementOptions {
    price: number;
    currency: Currency;
}

export const getBalance = async (
    owner: string,
    configuration: Configuration.Entity
): Promise<number> => {
    return configuration.blockchainProperties.certificateLogicInstance.balanceOf(owner);
};

export const ownerOf = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<string> => {
    return configuration.blockchainProperties.certificateLogicInstance.ownerOf(certId);
};

export const getApproved = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<string> => {
    return configuration.blockchainProperties.certificateLogicInstance.getApproved(certId);
};

export const getTradableToken = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<string> => {
    return configuration.blockchainProperties.certificateLogicInstance.getTradableToken(certId);
};

export const getOnchainDirectPurchasePrice = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<number> => {
    return configuration.blockchainProperties.certificateLogicInstance.getOnchainDirectPurchasePrice(
        certId
    );
};

export const isApprovedForAll = async (
    owner: string,
    matcher: string,
    configuration: Configuration.Entity
): Promise<boolean> => {
    return configuration.blockchainProperties.certificateLogicInstance.isApprovedForAll(
        owner,
        matcher
    );
};

export const setApprovalForAll = async (
    matcher: string,
    approved: boolean,
    configuration: Configuration.Entity
): Promise<TransactionReceipt> => {
    if (configuration.blockchainProperties.activeUser.privateKey) {
        return configuration.blockchainProperties.certificateLogicInstance.setApprovalForAll(
            matcher,
            approved,
            { privateKey: configuration.blockchainProperties.activeUser.privateKey }
        );
    } else {
        return configuration.blockchainProperties.certificateLogicInstance.setApprovalForAll(
            matcher,
            approved,
            { from: configuration.blockchainProperties.activeUser.address }
        );
    }
};

export abstract class Entity extends BlockchainDataModelEntity.Entity
    implements IOnChainProperties {
    assetId: number;
    owner: string;
    powerInW: number;
    forSale: boolean;
    acceptedToken?: number;
    onChainDirectPurchasePrice: number;
    offChainSettlementOptions: IOffChainSettlementOptions;
    escrow: string[];
    approvedAddress: string;

    initialized: boolean;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    async safeTransferFrom(_to: string, _calldata?: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async transferFrom(_to: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async approve(_approved: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getApproved(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getApproved(
            this.id
        );
    }

    async isApprovedForAll(matcher: string): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isApprovedForAll(
            this.owner,
            matcher
        );
    }

    async setTradableToken(token: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.setTradableToken(
                this.id,
                token,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.setTradableToken(
                this.id,
                token,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async setOnChainDirectPurchasePrice(price: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.setOnChainDirectPurchasePrice(
                this.id,
                price,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.setOnChainDirectPurchasePrice(
                this.id,
                price,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getTradableToken(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getTradableToken(
            this.id
        );
    }

    async getOnChainDirectPurchasePrice(): Promise<number> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getOnChainDirectPurchasePrice(
            this.id
        );
    }

    async removeEscrow(escrow: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.removeEscrow(
                this.id,
                escrow,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.removeEscrow(
                this.id,
                escrow,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async addEscrowForEntity(escrow: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.addEscrowForEntity(
                this.id,
                escrow,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.addEscrowForEntity(
                this.id,
                escrow,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async publishForSale(price: number, tokenAddress: any): Promise<any> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.publishForSale(
                this.id,
                price,
                tokenAddress,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.publishForSale(
                this.id,
                price,
                tokenAddress,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async unpublishForSale(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.unpublishForSale(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.unpublishForSale(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(this.id);
    }

    get offChainURL() {
        const certificateLogicAddress = this.configuration.blockchainProperties.certificateLogicInstance.web3Contract._address;

        return `${this.configuration.offChainDataSource.baseUrl}/TradableEntity/${certificateLogicAddress}`;
    }

    async setOffChainSettlementOptions(options: IOffChainSettlementOptions): Promise<void> {
        if (!this.configuration.offChainDataSource) {
            throw Error('No off chain data source set in the configuration');
        }

        await axios.put(`${this.offChainURL}/${this.id}`, options);
    }

    async getOffChainSettlementOptions(): Promise<IOffChainSettlementOptions> {
        if (!this.configuration.offChainDataSource) {
            throw Error('No off chain data source set in the configuration');
        }

        const result = await axios.get(`${this.offChainURL}/${this.id}`, {
            validateStatus: status => [200, 404].includes(status)
        });

        if (result.status === 404 || !result.data) {
            await this.setOffChainSettlementOptions({
                price: 0,
                currency: Currency.NONE
            });

            return await this.getOffChainSettlementOptions();
        }

        return result.data;
    }
}
