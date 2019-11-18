// eslint-disable-next-line import/no-unresolved
import { TransactionReceipt, EventLog } from 'web3/types';

import { Currency, Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';

import { MarketLogic } from '../wrappedContracts/MarketLogic';

export interface IPurchasableCertificate {
    id: string;

    certificate: Certificate.ICertificate;

    isOffChainSettlement: boolean;
    price: number;
    currency: Currency | string;

    forSale: boolean;
    acceptedToken?: string;
    onChainDirectPurchasePrice: number;

    sync(): Promise<IPurchasableCertificate>;
    splitCertificate(energy: number): Promise<TransactionReceipt>;
}

export interface IOffChainSettlementOptions {
    price: number;
    currency: Currency;
}

export const getCertificateListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
    return Certificate.getCertificateListLength(configuration);
};
export const getAllCertificates = async (configuration: Configuration.Entity) => {
    return Certificate.getAllCertificates(configuration);
};

export class Entity extends BlockchainDataModelEntity.Entity implements IPurchasableCertificate {
    public certificate: Certificate.ICertificate;

    public forSale: boolean;

    public acceptedToken?: string;

    public onChainDirectPurchasePrice: number;

    public initialized: boolean;

    public offChainSettlementOptions: IOffChainSettlementOptions;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        const marketLogicAddress = this.configuration.blockchainProperties.marketLogicInstance
            .web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/PurchasableCertificate/${marketLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const pCert = await this.configuration.blockchainProperties.marketLogicInstance.getPurchasableCertificate(
                this.id
            );

            this.certificate = await new Certificate.Entity(this.id, this.configuration).sync();
            this.forSale = pCert.forSale;
            this.acceptedToken = pCert.acceptedToken;
            this.onChainDirectPurchasePrice = Number(pCert.onChainDirectPurchasePrice); // TODO: should be BN

            this.offChainSettlementOptions = await this.getOffChainSettlementOptions();

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`PurchasableCertificate ${this.id} synced`);
            }
        }

        return this;
    }

    async buyCertificate(wh?: number): Promise<TransactionReceipt> {
        const logic: MarketLogic = this.configuration.blockchainProperties.marketLogicInstance;
        const id = Number(this.id);

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

            if (Number(this.certificate.status) === Certificate.Status.Split) {
                for (const certificateId of this.certificate.children) {
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
        }
        return logic.buyCertificate(id, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: ''
        });
    }

    async claimCertificate(): Promise<TransactionReceipt> {
        return this.certificate.claimCertificate();
    }

    async splitCertificate(energy: number): Promise<TransactionReceipt> {
        return this.certificate.splitCertificate(energy);
    }

    async publishForSale(
        price: number,
        tokenAddressOrCurrency: string | Currency,
        wh?: number
    ): Promise<void> {
        const isErc20Sale: boolean = this.configuration.blockchainProperties.web3.utils.isAddress(
            tokenAddressOrCurrency
        );
        const isFiatSale: boolean = typeof tokenAddressOrCurrency !== 'string';

        let certificate;

        if (!isErc20Sale && !isFiatSale) {
            throw Error('Please specify either an ERC20 token address or a currency.');
        }

        const certificateEnergy = Number(this.certificate.energy);
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
            await this.configuration.blockchainProperties.marketLogicInstance.publishForSale(
                this.id,
                saleParams.onChainPrice,
                saleParams.tokenAddress,
                this.configuration.blockchainProperties.activeUser.privateKey
                    ? { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
                    : { from: this.configuration.blockchainProperties.activeUser.address }
            );

            certificate = await new Entity(this.id, this.configuration).sync();
        } else {
            await this.configuration.blockchainProperties.marketLogicInstance.splitAndPublishForSale(
                this.id,
                wh,
                saleParams.onChainPrice,
                saleParams.tokenAddress,
                this.configuration.blockchainProperties.activeUser.privateKey
                    ? { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
                    : { from: this.configuration.blockchainProperties.activeUser.address }
            );

            await this.sync();

            certificate = await new Entity(this.certificate.children[0], this.configuration).sync();
        }

        await certificate.setOffChainSettlementOptions({
            price: saleParams.offChainPrice,
            currency: saleParams.offChainCurrency as Currency
        });
    }

    get isOffChainSettlement(): boolean {
        return Number(this.acceptedToken) === 0x0;
    }

    get price() {
        return this.isOffChainSettlement
            ? this.offChainSettlementOptions.price
            : this.onChainDirectPurchasePrice;
    }

    get currency() {
        return this.isOffChainSettlement
            ? this.offChainSettlementOptions.currency
            : this.acceptedToken;
    }

    async getCertificateOwner(): Promise<string> {
        return this.certificate.getCertificateOwner();
    }

    async isClaimed(): Promise<boolean> {
        return this.certificate.isClaimed();
    }

    async claim() {
        return this.certificate.claim();
    }

    async approve(_approved: string): Promise<TransactionReceipt> {
        return this.certificate.approve(_approved);
    }

    async getApproved(): Promise<string> {
        return this.certificate.getApproved();
    }

    async getTradableToken(): Promise<string> {
        return this.configuration.blockchainProperties.marketLogicInstance.getTradableToken(
            this.id
        );
    }

    async getOnChainDirectPurchasePrice(): Promise<number> {
        return this.configuration.blockchainProperties.marketLogicInstance.getOnChainDirectPurchasePrice(
            this.id
        );
    }

    async unpublishForSale(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.marketLogicInstance.unpublishForSale(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.marketLogicInstance.unpublishForSale(
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async setOffChainSettlementOptions(options: IOffChainSettlementOptions): Promise<void> {
        if (!this.configuration.offChainDataSource) {
            throw Error('No off chain data source set in the configuration');
        }

        await this.offChainDataClient.insertOrUpdate(this.getUrl(), {
            properties: options,
            salts: [],
            schema: []
        }); // TODO: anchor those options on the smart contract
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
            const { properties } = await this.offChainDataClient.get<IOffChainSettlementOptions>(
                this.getUrl()
            );

            return properties;
        } catch (error) {
            if (error.response.status !== 404) {
                throw error;
            }

            await this.setOffChainSettlementOptions(defaultValues);

            return defaultValues;
        }
    }

    async getCertificationRequestEvents() {
        return this.certificate.getCertificationRequestEvents();
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return this.certificate.getAllCertificateEvents();
    }

    async safeTransferFrom(_to: string, _calldata?: string): Promise<TransactionReceipt> {
        return this.certificate.safeTransferFrom(_to, _calldata);
    }

    async transferFrom(_to: string): Promise<TransactionReceipt> {
        return this.certificate.transferFrom(_to);
    }
}
