import { TransactionReceipt, EventLog } from 'web3/types';
import { Currency, Unit } from '@energyweb/utils-general';
import { Configuration } from '../utils/types';

import * as TradableEntity from './TradableEntity';
import { CertificateLogic } from '..';

export enum Status {
    Active,
    Retired,
    Split
}

export interface ICertificate extends TradableEntity.IOnChainProperties {
    id: string;
    status: number;
    dataLog: string;
    creationTime: number;
    parentId: number;
    children: string[];
    maxOwnerChanges: number;
    ownerChangerCounter: number;

    pricePerUnit(unit: Unit): number;
    sync(): Promise<ICertificate>;
    splitCertificate(energy: number): Promise<TransactionReceipt>;
    transferFrom(_to: string): Promise<TransactionReceipt>;
}

export const getCertificateListLength = async (
    configuration: Configuration
): Promise<number> => {
    return parseInt(
        await configuration.blockchainProperties.certificateLogicInstance.getCertificateListLength(),
        10
    );
};

export const getAllCertificates = async (configuration: Configuration) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return Promise.all(certificatePromises);
};

export const getActiveCertificates = async (configuration: Configuration) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    const certs = await Promise.all(certificatePromises);

    return certs.filter((cert: Entity) => Number(cert.status) === Status.Active);
};

export const isRetired = async (
    certId: number,
    configuration: Configuration
): Promise<boolean> => {
    return configuration.blockchainProperties.certificateLogicInstance.isRetired(certId);
};

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration
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

export class Entity extends TradableEntity.Entity implements ICertificate {
    status: number;
    dataLog: string;
    creationTime: number;
    parentId: number;
    children: string[];
    maxOwnerChanges: number;
    ownerChangerCounter: number;

    getUrl(): string {
        const certificateLogicAddress = this.configuration.blockchainProperties.certificateLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/Certificate/${certificateLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const cert = await this.configuration.blockchainProperties.certificateLogicInstance.getCertificate(
                this.id
            );

            this.assetId = cert.tradableEntity.assetId;
            this.owner = cert.tradableEntity.owner;
            this.energy = Number(cert.tradableEntity.energy);
            this.forSale = cert.tradableEntity.forSale;
            this.acceptedToken = cert.tradableEntity.acceptedToken;
            this.onChainDirectPurchasePrice = cert.tradableEntity.onChainDirectPurchasePrice;
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

    async splitCertificate(energy: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                energy,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                energy,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
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
            currency: (saleParams.offChainCurrency as Currency)
        });
    }

    pricePerUnit(unit: Unit) {
        const isOffChainSettlement = Number(this.acceptedToken) === 0x0;
        const price = isOffChainSettlement ? this.offChainSettlementOptions.price : this.onChainDirectPurchasePrice;

        return price / this.energy * unit;
    }

    async getCertificateOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
            this.id
        );
    }

    async isRetired(): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isRetired(this.id);
    }

    async claim() {
        const accountProperties = {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        };

        return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
            parseInt(this.id, 10),
            accountProperties
        );
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

export async function claimCertificates(
    certificateIds: string[],
    configuration: Configuration
) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    const accountProperties = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    return configuration.blockchainProperties.certificateLogicInstance.claimCertificateBulk(certificateIdsAsNumber, accountProperties);
};
