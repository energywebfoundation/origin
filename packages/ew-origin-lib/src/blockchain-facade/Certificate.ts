import * as GeneralLib from 'ew-utils-general-lib';
import * as TradableEntity from '..';
import { CertificateLogic } from 'ew-origin-contracts';
import { logger } from './Logger';

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

export const getBalance = async (owner: string, configuration: GeneralLib.Configuration.Entity): Promise<number> => {
    return (configuration.blockchainProperties.certificateLogicInstance.balanceOf(owner));
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

            this.retired = cert.certificateSpecific.retired;
            this.dataLog = cert.certificateSpecific.dataLog;
            this.creationTime = cert.certificateSpecific.creationTime;
            this.parentId = cert.certificateSpecific.parentId;
            this.maxOwnerChanges = cert.certificateSpecific.maxOwnerChanges;
            this.ownerChangerCounter = cert.certificateSpecific.ownerChangeCounter;
            this.initialized = true;

            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }
        return this;
    }

}