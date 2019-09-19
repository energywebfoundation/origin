import { Agreement, Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

import { IEntityStore } from './EntityStore';

@injectable()
export class CertificateService {
    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async matchAgreement(
        certificate: Certificate.ICertificate,
        agreement: Agreement.IAgreement
    ) {
        const demand = this.entityStore.getDemandById(agreement.demandId.toString());
        if (await this.isAlreadyTransferred(certificate, demand.demandOwner)) {
            return false;
        }

        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        await certificate.transferFrom(demand.demandOwner);
        return true;
    }

    public async splitCertificate(
        certificate: Certificate.ICertificate,
        requiredEnergy: number
    ): Promise<void> {
        this.logger.info(`Splitting certificate ${certificate.id} at ${requiredEnergy}`);

        await certificate.splitCertificate(requiredEnergy);
    }

    public async matchDemand(certificate: Certificate.ICertificate, demand: Demand.IDemand) {
        if (await this.isAlreadyTransferred(certificate, demand.demandOwner)) {
            return false;
        }

        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        await certificate.transferFrom(demand.demandOwner);

        return true;
    }

    private async isAlreadyTransferred(certificate: Certificate.ICertificate, owner: string) {
        const syncedCertificate = await certificate.sync();

        this.logger.verbose(
            `isAlreadyTransferred: #${syncedCertificate.id} owned by ${syncedCertificate.owner}`
        );

        if (certificate.owner.toLowerCase() === owner.toLowerCase()) {
            this.logger.info(
                `Certificate #${syncedCertificate.id} was already transferred to ${owner}`
            );
            return true;
        }

        return false;
    }
}
