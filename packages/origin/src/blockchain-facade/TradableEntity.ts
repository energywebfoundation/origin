import { Configuration, BlockchainDataModelEntity, Currency } from '@energyweb/utils-general';
import { TransactionReceipt } from 'web3/types';

export interface IOnChainProperties {
    assetId: number;
    owner: string;
    energy: number;
    forSale: boolean;
    acceptedToken?: string;
    onChainDirectPurchasePrice: number;
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
    energy: number;
    forSale: boolean;
    acceptedToken?: string;
    onChainDirectPurchasePrice: number;
    approvedAddress: string;

    initialized: boolean;

    offChainSettlementOptions: IOffChainSettlementOptions;

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
        const certificateLogicAddress = this.configuration.blockchainProperties
            .certificateLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/TradableEntity/${certificateLogicAddress}/${this.id}`;
    }

    async setOffChainSettlementOptions(options: IOffChainSettlementOptions): Promise<void> {
        if (!this.configuration.offChainDataSource) {
            throw Error('No off chain data source set in the configuration');
        }

        await this.offChainDataClient.insertOrUpdate(this.offChainURL, {
            properties: options,
            salts: [],
            schema: []
        }); //TODO: anchor those options on the smart contract
    }

    async getOffChainSettlementOptions(): Promise<IOffChainSettlementOptions> {
        if (!this.configuration.offChainDataSource) {
            throw Error('No off chain data source set in the configuration');
        }

        const defaultValues: IOffChainSettlementOptions = {
            price: 0,
            currency: Currency.NONE
        };

        try {
            const { properties } = await this.offChainDataClient.get<IOffChainSettlementOptions>(this.offChainURL);
            
            return properties;
        } catch (error) {
            if (error.response.status !== 404) {
                throw error;
            }

            await this.setOffChainSettlementOptions(defaultValues);

            return defaultValues;
        }
    }
}
