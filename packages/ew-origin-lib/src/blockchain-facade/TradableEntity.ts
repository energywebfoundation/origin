import * as GeneralLib from 'ew-utils-general-lib';
import { TransactionReceipt } from 'web3/types';

export interface OnChainProperties {
    assetId: number;
    owner: string;
    powerInW: number;
    acceptedToken?: number;
    onCHainDirectPurchasePrice: number;
    escrow: string[];
    approvedAddress: string;
}

export const getBalance = async (owner: string, configuration: GeneralLib.Configuration.Entity): Promise<number> => {
    return (configuration.blockchainProperties.certificateLogicInstance.balanceOf(owner));
};

export const ownerOf = async (certId: number, configuration: GeneralLib.Configuration.Entity): Promise<string> => {
    return (configuration.blockchainProperties.certificateLogicInstance.ownerOf(certId));
};

export const getApproved = async (certId: number, configuration: GeneralLib.Configuration.Entity): Promise<string> => {
    return configuration.blockchainProperties.certificateLogicInstance.getApproved(certId);
};

export const getTradableToken = async (
    certId: number,
    configuration: GeneralLib.Configuration.Entity,
): Promise<string> => {
    return configuration.blockchainProperties.certificateLogicInstance.getTradableToken(certId);
};

export const getOnchainDirectPurchasePrice = async (
    certId: number,
    configuration: GeneralLib.Configuration.Entity,
): Promise<number> => {
    return configuration.blockchainProperties.certificateLogicInstance.getOnchainDirectPurchasePrice(certId);
};

export const isApprovedForAll = async (
    owner: string,
    matcher: string,
    configuration: GeneralLib.Configuration.Entity,
): Promise<boolean> => {
    return configuration.blockchainProperties.certificateLogicInstance.isApprovedForAll(owner, matcher);
};

export const setApprovalForAll = async (
    matcher: string,
    approved: boolean,
    configuration: GeneralLib.Configuration.Entity): Promise<TransactionReceipt> => {

    if (configuration.blockchainProperties.activeUser.privateKey) {
        return configuration.blockchainProperties.certificateLogicInstance.setApprovalForAll(
            matcher,
            approved,
            { privateKey: configuration.blockchainProperties.activeUser.privateKey });
    } else {
        return configuration.blockchainProperties.certificateLogicInstance.setApprovalForAll(
            matcher,
            approved,
            { from: configuration.blockchainProperties.activeUser.address },
        );
    }
};
export abstract class Entity extends GeneralLib.BlockchainDataModelEntity.Entity implements OnChainProperties {
    assetId: number;
    owner: string;
    powerInW: number;
    acceptedToken?: number;
    onCHainDirectPurchasePrice: number;
    escrow: string[];
    approvedAddress: string;

    initialized: boolean;

    constructor(id: string, configuration: GeneralLib.Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;

    }

    async safeTransferFrom(
        _to: string,
        _calldata?: string,
    ): Promise<TransactionReceipt> {

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async transferFrom(
        _to: string,
    ): Promise<TransactionReceipt> {

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async approve(
        _approved: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async getApproved(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getApproved(this.id);
    }

    async isApprovedForAll(matcher: string): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isApprovedForAll(this.owner, matcher);
    }

    async setTradableToken(token: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.setTradableToken(
                this.id,
                token,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.setTradableToken(
                this.id,
                token,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async setOnChainDirectPurchasePrice(price: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.setOnChainDirectPurchasePrice(
                this.id,
                price,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.setOnChainDirectPurchasePrice(
                this.id,
                price,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

    async getTradableToken(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getTradableToken(this.id);
    }

    async getOnChainDirectPurchasePrice(): Promise<number> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getOnChainDirectPurchasePrice(this.id);
    }

    async removeEscrow(escrow: string): Promise<TransactionReceipt> {

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.removeEscrow(
                this.id,
                escrow,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.removeEscrow(
                this.id,
                escrow,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

    async addEscrowForEntity(escrow: string): Promise<TransactionReceipt> {

        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.addEscrowForEntity(
                this.id,
                escrow,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.addEscrowForEntity(
                this.id,
                escrow,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

    async getOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(this.id);
    }

}