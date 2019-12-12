import { TransactionReceipt, EventLog } from 'web3-core';
import polly from 'polly-js';

import { Currency, Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';

import { MarketLogic } from '../wrappedContracts/MarketLogic';
import PurchasableCertificateOffChainPropertiesSchema from '../../schemas/PurchasableCertificateOffChainProperties.schema.json';

const DEFAULT_OFF_CHAIN_PROPERTIES = {
    price: 0,
    currency: Currency.NONE
};

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

export interface IPurchasableCertificateOffChainProperties {
    price: number;
    currency: Currency;
}

export const getCertificateListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
    return Certificate.getCertificateListLength(configuration);
};

export const getAllCertificates = async (configuration: Configuration.Entity) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return Promise.all(certificatePromises);
};

export class Entity extends BlockchainDataModelEntity.Entity implements IPurchasableCertificate {
    public certificate: Certificate.ICertificate;

    public forSale: boolean;

    public acceptedToken?: string;

    public onChainDirectPurchasePrice: number;

    public initialized: boolean;

    public offChainProperties: IPurchasableCertificateOffChainProperties;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const pCert = await this.configuration.blockchainProperties.marketLogicInstance.getPurchasableCertificate(
                this.id
            );

            this.propertiesDocumentHash = pCert.propertiesDocumentHash;
            this.url = pCert.documentDBURL;
            this.certificate = await new Certificate.Entity(this.id, this.configuration).sync();
            this.forSale = pCert.forSale;
            this.acceptedToken = pCert.acceptedToken;
            this.onChainDirectPurchasePrice = Number(pCert.onChainDirectPurchasePrice); // TODO: should be BN
            this.offChainProperties =
                this.forSale && this.isOffChainSettlement
                    ? await this.getOffChainProperties()
                    : DEFAULT_OFF_CHAIN_PROPERTIES;

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`PurchasableCertificate ${this.id} synced`);
            }
        }

        return this;
    }

    async buyCertificate(wh?: number): Promise<TransactionReceipt> {
        const logic: MarketLogic = this.configuration.blockchainProperties.marketLogicInstance;
        const { activeUser } = this.configuration.blockchainProperties;

        const id = Number(this.id);

        if (wh) {
            const parentOffChainData = await this.getOffChainDump();

            const firstChildCertificate = new Entity(null, this.configuration);
            await polly()
                .waitAndRetry(10)
                .executeForPromise(async () => {
                    firstChildCertificate.id = (
                        await getCertificateListLength(this.configuration)
                    ).toString();
                    await firstChildCertificate.throwIfExists();
                });

            await firstChildCertificate.syncOffChainStorage(this.offChainProperties, {
                rootHash: this.propertiesDocumentHash,
                salts: parentOffChainData.salts,
                schema: parentOffChainData.schema
            });

            const secondChildId = Number(firstChildCertificate.id) + 1;
            const secondChildCertificate = new Entity(secondChildId.toString(), this.configuration);

            await secondChildCertificate.syncOffChainStorage(this.offChainProperties, {
                rootHash: this.propertiesDocumentHash,
                salts: parentOffChainData.salts,
                schema: parentOffChainData.schema
            });

            const txResult = await logic.splitAndBuyCertificate(id, wh, {
                from: activeUser.address,
                privateKey: activeUser.privateKey
            });

            await this.sync();

            if (Number(this.certificate.status) === Certificate.Status.Split) {
                if (
                    firstChildCertificate.propertiesDocumentHash !== this.propertiesDocumentHash ||
                    secondChildCertificate.propertiesDocumentHash !== this.propertiesDocumentHash
                ) {
                    throw new Error('publishForSale: Non-matching hashes.');
                }

                const [childOneId, childTwoId] = this.certificate.children;

                if (firstChildCertificate.id !== childOneId) {
                    firstChildCertificate.id = childOneId;
                    await firstChildCertificate.syncOffChainStorage(this.offChainProperties, {
                        rootHash: this.propertiesDocumentHash,
                        salts: parentOffChainData.salts,
                        schema: parentOffChainData.schema
                    });
                }

                if (secondChildCertificate.id !== childTwoId) {
                    secondChildCertificate.id = childTwoId;
                    await secondChildCertificate.syncOffChainStorage(this.offChainProperties, {
                        rootHash: this.propertiesDocumentHash,
                        salts: parentOffChainData.salts,
                        schema: parentOffChainData.schema
                    });
                }
            }

            return txResult;
        }

        return logic.buyCertificate(id, {
            from: activeUser.address,
            privateKey: activeUser.privateKey
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
        const { activeUser } = this.configuration.blockchainProperties;
        const isErc20Sale: boolean = this.configuration.blockchainProperties.web3.utils.isAddress(
            tokenAddressOrCurrency.toString()
        );
        const isFiatSale: boolean = typeof tokenAddressOrCurrency !== 'string';

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

        const newOffChainProperties = {
            price: saleParams.offChainPrice,
            currency: saleParams.offChainCurrency
        };
        const updatedOffChainStorageProperties = this.prepareEntityCreation(
            newOffChainProperties,
            PurchasableCertificateOffChainPropertiesSchema
        );

        if (wh !== undefined && wh !== certificateEnergy) {
            const firstChildCertificate = new Entity(null, this.configuration);

            await polly()
                .waitAndRetry(10)
                .executeForPromise(async () => {
                    firstChildCertificate.id = (
                        await getCertificateListLength(this.configuration)
                    ).toString();
                    await firstChildCertificate.throwIfExists();
                });

            await firstChildCertificate.syncOffChainStorage(
                newOffChainProperties,
                updatedOffChainStorageProperties
            );

            await this.configuration.blockchainProperties.marketLogicInstance.splitAndPublishForSale(
                this.id,
                wh,
                saleParams.onChainPrice,
                saleParams.tokenAddress,
                updatedOffChainStorageProperties.rootHash,
                this.fullUrl,
                { from: activeUser.address, privateKey: activeUser.privateKey }
            );

            await this.sync();

            if (
                firstChildCertificate.propertiesDocumentHash !==
                updatedOffChainStorageProperties.rootHash
            ) {
                throw new Error('publishForSale: Non-matching hashes.');
            }

            const [childOneId] = this.certificate.children;

            if (firstChildCertificate.id !== childOneId) {
                firstChildCertificate.id = childOneId;
                await firstChildCertificate.syncOffChainStorage(
                    newOffChainProperties,
                    updatedOffChainStorageProperties
                );
            }

            await firstChildCertificate.sync();

            return;
        }

        await this.syncOffChainStorage(newOffChainProperties, updatedOffChainStorageProperties);

        await this.configuration.blockchainProperties.marketLogicInstance.publishForSale(
            this.id,
            saleParams.onChainPrice,
            saleParams.tokenAddress,
            updatedOffChainStorageProperties.rootHash,
            this.fullUrl,
            { from: activeUser.address, privateKey: activeUser.privateKey }
        );
    }

    get isOffChainSettlement(): boolean {
        return Number(this.acceptedToken) === 0x0;
    }

    get price() {
        if (!this.initialized) {
            throw new Error(`PurchasableCertificate #${this.id} has not been initialized yet.`);
        }

        return this.isOffChainSettlement
            ? this.offChainProperties.price
            : this.onChainDirectPurchasePrice;
    }

    get currency() {
        return this.isOffChainSettlement ? this.offChainProperties.currency : this.acceptedToken;
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
        return this.configuration.blockchainProperties.marketLogicInstance.unpublishForSale(
            this.id,
            {
                from: this.configuration.blockchainProperties.activeUser.address,
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            }
        );
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
