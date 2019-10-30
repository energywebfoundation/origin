import axios, { AxiosResponse } from 'axios';

import { Configuration, BlockchainDataModelEntity, Currency } from '@energyweb/utils-general';
import { TransactionReceipt } from 'web3/types';

export interface IOnChainProperties {
    assetId: number;
    owner: string;
    energy: number;
    approvedAddress: string;
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
    energy: number;
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

    async getOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(this.id);
    }
}
