import { TransactionReceipt, EventLog } from 'web3/types';

import { Currency, Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';
import { ProducingAsset, Asset } from '@energyweb/asset-registry';

import { CertificateLogic } from '..';

export enum Status {
    Active,
    Claimed,
    Split
}

export interface ICertificate {
    id: string;

    assetId: number;
    generationStartTime: number;
    generationEndTime: number;

    owner: string;
    energy: number;
    status: Status;
    creationTime: number;
    parentId: number;
    children: string[];
    isOffChainSettlement: boolean;
    price: number;
    currency: Currency | string;

    forSale: boolean;
    acceptedToken?: string;
    onChainDirectPurchasePrice: number;

    sync(): Promise<ICertificate>;
    splitCertificate(energy: number): Promise<TransactionReceipt>;
    transferFrom(_to: string): Promise<TransactionReceipt>;
}

export interface IOffChainSettlementOptions {
    price: number;
    currency: Currency;
}

export const getCertificateListLength = async (configuration: Configuration.Entity): Promise<number> => {
    return parseInt(
        await configuration.blockchainProperties.certificateLogicInstance.getCertificateListLength(),
        10
    );
};

const getAccountFromConfiguration = (configuration: Configuration.Entity) => ({
    from: configuration.blockchainProperties.activeUser.address,
    privateKey: configuration.blockchainProperties.activeUser.privateKey
});

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

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<EventLog[]> => {
    const allEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
        {
            topics: [
                null,
                configuration.blockchainProperties.web3.utils.padLeft(
                    configuration.blockchainProperties.web3.utils.fromDecimal(certId),
                    64,
                    '0'
                )
            ],
            toBlock: undefined
        }
    );

    const returnEvents = [];

    for (const fullEvent of allEvents) {
        // we have to remove some false positives due to ERC721 interface
        if (fullEvent.event === 'Transfer') {
            if (fullEvent.returnValues._tokenId === `${certId}`) {
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
                ],
                toBlock: undefined
            }
        );

        for (const transferEvent of transferEvents) {
            returnEvents.push(transferEvent);
        }
    }

    return returnEvents;
};

export class Entity extends BlockchainDataModelEntity.Entity implements ICertificate {
    public assetId: number;
    public generationStartTime: number;
    public generationEndTime: number;

    public owner: string;
    public energy: number;
    public status: Status;
    public creationTime: number;
    public parentId: number;
    public children: string[];

    public forSale: boolean;
    public acceptedToken?: string;
    public onChainDirectPurchasePrice: number;

    public initialized: boolean;

    public offChainSettlementOptions: IOffChainSettlementOptions

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        const certificateLogicAddress = this.configuration.blockchainProperties
            .certificateLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/Certificate/${certificateLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const certificateLogicInstance: CertificateLogic = this.configuration.blockchainProperties.certificateLogicInstance;

            const cert = await certificateLogicInstance.getCertificate(
                Number(this.id)
            );
            
            this.assetId = Number(cert.assetId);
            this.owner = await this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(this.id);
            this.energy = Number(cert.energy);
            this.forSale = cert.forSale;
            this.acceptedToken = cert.acceptedToken;
            this.onChainDirectPurchasePrice = Number(cert.onChainDirectPurchasePrice); //TODO: should be BN

            this.children = cert.children;
            this.status = Number(cert.status);
            this.creationTime = Number(cert.creationTime);
            this.parentId = Number(cert.parentId);
            this.offChainSettlementOptions = await this.getOffChainSettlementOptions();

            const reads = await new ProducingAsset.Entity(this.assetId.toString(), this.configuration).getSmartMeterReadsByIndex([Number(cert.readsStartIndex), Number(cert.readsEndIndex)]);
            this.generationStartTime = reads[0].timestamp;
            this.generationEndTime = reads[1].timestamp;

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Certificate ${this.id} synced`);
            }
        }

        return this;
    }

    async buyCertificate(wh?: number): Promise<TransactionReceipt> {
        const logic: CertificateLogic = this.configuration.blockchainProperties.certificateLogicInstance;
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
        }
        return logic.buyCertificate(id, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: ''
        });
    }

    async retireCertificate(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async splitCertificate(energy: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                energy,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
            this.id,
            energy,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
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

        const certificateEnergy = Number(this.energy);
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

            certificate = await new Entity(this.children[0], this.configuration).sync();
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
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
            this.id
        );
    }

    async isClaimed(): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isClaimed(this.id);
    }

    async claim() {
        const accountProperties = {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        };

        return this.configuration.blockchainProperties.certificateLogicInstance.claimCertificate(
            parseInt(this.id, 10),
            accountProperties
        );
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
        return this.configuration.blockchainProperties.certificateLogicInstance.getApproved(this.id);
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

    async getCertificationRequestEvents() {
        const {
            certificateLogicInstance
        }: {
            certificateLogicInstance?: CertificateLogic;
        } = this.configuration.blockchainProperties;

        const logCreatedEvents = await certificateLogicInstance.getAllLogCreatedCertificateEvents({
            filter: {
                _certificateId: this.id
            },
            fromBlock: 0
        });

        const logCreatedEvent = logCreatedEvents[0];

        if (!logCreatedEvent) {
            return null;
        }

        const certificationRequestsApprovedEvents = await certificateLogicInstance.getAllCertificationApprovedEvents(
            {
                filter: {
                    assetId: this.assetId
                },
                fromBlock: logCreatedEvent.blockNumber,
                toBlock: logCreatedEvent.blockNumber
            }
        );

        if (
            !certificationRequestsApprovedEvents ||
            certificationRequestsApprovedEvents.length === 0
        ) {
            return null;
        }

        const allReads = await (await new ProducingAsset.Entity(
            this.assetId.toString(),
            this.configuration
        ).sync()).getSmartMeterReads();

        const approvedCertificationRequestEvent = certificationRequestsApprovedEvents.filter(
            request => {
                return (
                    allReads
                        .slice(
                            request.returnValues.readsStartIndex,
                            parseInt(request.returnValues.readsEndIndex, 10) + 1
                        )
                        .reduce((a, b) => a + b.energy, 0) === this.energy
                );
            }
        )[0];

        const certificationRequestsCreatedEvents = await certificateLogicInstance.getAllCertificationCreatedEvents(
            {
                filter: {
                    readsStartIndex: approvedCertificationRequestEvent.returnValues.readsStartIndex,
                    readsEndIndex: approvedCertificationRequestEvent.returnValues.readsEndIndex,
                    assetId: this.assetId
                },
                fromBlock: 0
            }
        );

        if (
            !certificationRequestsCreatedEvents ||
            certificationRequestsCreatedEvents.length === 0
        ) {
            return null;
        }

        return {
            approvedCertificationRequestEvent,
            certificationRequestCreatedEvent: certificationRequestsCreatedEvents[0]
        };
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        const allEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
            {
                topics: [
                    null,
                    this.configuration.blockchainProperties.web3.utils.padLeft(
                        this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
                        64,
                        '0'
                    )
                ],
                fromBlock: 0
            }
        );

        const returnEvents = [];

        for (const fullEvent of allEvents) {
            // we have to remove some false positives due to ERC721 interface
            if (fullEvent.event === 'Transfer') {
                if (fullEvent.returnValues._tokenId === `${this.id}`) {
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
                    ],
                    fromBlock: 0
                }
            );

            for (const transferEvent of transferEvents) {
                returnEvents.push(transferEvent);
            }
        }

        return returnEvents;
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
}

export async function claimCertificates(certificateIds: string[], configuration: Configuration.Entity) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    return configuration.blockchainProperties.certificateLogicInstance.claimCertificateBulk(
        certificateIdsAsNumber,
        getAccountFromConfiguration(configuration)
    );
}

export async function requestCertificates(
    assetId: string,
    limitingSmartMeterReadIndex: number,
    configuration: Configuration.Entity
) {
    return configuration.blockchainProperties.certificateLogicInstance.requestCertificates(
        parseInt(assetId, 10),
        limitingSmartMeterReadIndex,
        getAccountFromConfiguration(configuration)
    );
}

export async function approveCertificationRequest(
    certicationRequestIndex: number,
    configuration: Configuration.Entity
) {
    return configuration.blockchainProperties.certificateLogicInstance.approveCertificationRequest(
        certicationRequestIndex,
        getAccountFromConfiguration(configuration)
    );
}
