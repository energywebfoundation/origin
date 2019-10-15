import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { inject, injectable } from 'tsyringe';
import { TransactionReceipt } from 'web3/types'; // eslint-disable-line import/no-unresolved
import * as Winston from 'winston';

import { IEntityStore } from './EntityStore';

// eslint-disable-next-line import/no-unresolved
@injectable()
export class CertificateService {
    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async splitCertificate(
        certificate: Certificate.ICertificate,
        requiredEnergy: number
    ): Promise<boolean> {
        this.logger.info(`Splitting certificate ${certificate.id} at ${requiredEnergy}`);

        const splitTx = await certificate.splitCertificate(requiredEnergy);

        return splitTx.status;
    }

    public async matchDemand(certificate: Certificate.ICertificate, demand: Demand.IDemand) {
        if (
            (await this.isAlreadyTransferred(certificate, demand.demandOwner)) ||
            demand.status !== Demand.DemandStatus.ACTIVE
        ) {
            return false;
        }

        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        const fillTx: TransactionReceipt = await demand.fill(certificate.id);

        return fillTx.status;
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
