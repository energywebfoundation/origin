import * as GeneralLib from 'ew-utils-general-lib';
import * as TradableEntity from '..';
import { CertificateLogic } from 'ew-origin-contracts';
import { logger } from './Logger';
import { TransactionReceipt, Log } from 'web3/types';

export interface CertificateSpecific extends TradableEntity.TradableEntity.OnChainProperties {
    retired: boolean;
    dataLog: string;
    creationTime: number;
    parentId: number;
    children: number[];
    maxOwnerChanges: number;
    ownerChangerCounter: number;
}

export const getCertificateListLength = async (configuration: GeneralLib.Configuration.Entity): Promise<number> => {
    return parseInt(await configuration.blockchainProperties.certificateLogicInstance.getCertificateListLength(), 10);
};

export const getAllCertificates = async (configuration: GeneralLib.Configuration.Entity) => {

    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync());

    return Promise.all(certificatePromises);

};

export const isRetired = async (certId: number, configuration: GeneralLib.Configuration.Entity): Promise<boolean> => {
    return configuration.blockchainProperties.certificateLogicInstance.isRetired(certId);
};

export const getAllCertificateEvents = async (
    certId: number,
    configuration: GeneralLib.Configuration.Entity): Promise<Log[]> => {

    const allEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
        {
            topics: [null, configuration.blockchainProperties.web3.utils.padLeft(configuration.blockchainProperties.web3.utils.fromDecimal(certId), 64, '0')],
        });

    const returnEvents = [];

    for (const fullEvent of allEvents) {

        // we have to remove some false positives due to ERC721 interface
        if (fullEvent.event === 'Transfer') {

            if (fullEvent.returnValues._tokenId === '' + certId) {
                returnEvents.push(fullEvent);
            }
        }
        else {
            returnEvents.push(fullEvent);
        }

    }

    // we also have to search 
    if (certId !== 0) {

        const transferEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
            {
                topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, null, configuration.blockchainProperties.web3.utils.padLeft(configuration.blockchainProperties.web3.utils.fromDecimal(certId), 64, '0')],
            });

        for (const transferEvent of transferEvents) {
            returnEvents.push(transferEvent);
        }

    }

    return returnEvents;
};

export class Entity extends TradableEntity.TradableEntity.Entity
    implements CertificateSpecific {

    retired: boolean;
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
            const cert = await this.configuration.blockchainProperties.certificateLogicInstance.getCertificate(this.id);

            this.assetId = cert.tradableEntity.assetId;
            this.owner = cert.tradableEntity.owner;
            this.powerInW = cert.tradableEntity.powerInW;
            this.acceptedToken = cert.tradableEntity.acceptedToken;
            this.onCHainDirectPurchasePrice = cert.tradableEntity.onChainDirectPurchasePrice;
            this.escrow = cert.tradableEntity.escrow;
            this.approvedAddress = cert.tradableEntity.approvedAddress;

            this.children = cert.certificateSpecific.children;
            this.retired = cert.certificateSpecific.retired;
            this.dataLog = cert.certificateSpecific.dataLog;
            this.creationTime = cert.certificateSpecific.creationTime;
            this.parentId = cert.certificateSpecific.parentId;
            this.maxOwnerChanges = cert.certificateSpecific.maxOwnerChanges;
            this.ownerChangerCounter = cert.certificateSpecific.ownerChangeCounter;
            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Certificate ${this.id} synced`);
            }

        }
        return this;
    }

    async buyCertificate(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.buyCertificate(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.buyCertificate(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async retireCertificate(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address });
        }
    }

    async splitCertificate(power: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                power,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey });
        }
        else {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                power,
                { from: this.configuration.blockchainProperties.activeUser.address },
            );
        }
    }

    async getCertificateOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(this.id);
    }

    async isRetired(): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isRetired(this.id);
    }

    async getAllCertificateEvents(): Promise<Log[]> {

        const allEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
            {
                topics: [null,
                    this.configuration.blockchainProperties.web3.utils.padLeft(this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0'),
                ],
            });

        const returnEvents = [];

        for (const fullEvent of allEvents) {

            // we have to remove some false positives due to ERC721 interface
            if (fullEvent.event === 'Transfer') {

                if (fullEvent.returnValues._tokenId === '' + this.id) {
                    returnEvents.push(fullEvent);
                }
            }
            else {
                returnEvents.push(fullEvent);
            }

        }

        // we also have to search 
        if (this.id !== '0') {

            const transferEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
                {
                    topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                        null,
                        null,
                        this.configuration.blockchainProperties.web3.utils.padLeft(this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0')],
                });

            for (const transferEvent of transferEvents) {
                returnEvents.push(transferEvent);
            }

        }

        return returnEvents;
    }

}