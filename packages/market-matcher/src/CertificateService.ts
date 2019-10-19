import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

// eslint-disable-next-line import/no-unresolved
@injectable()
export class CertificateService {
    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async splitCertificate(
        certificate: Certificate.ICertificate,
        requiredEnergy: number
    ): Promise<boolean> {
        this.logger.info(`[Certificate #${certificate.id}] Splitting at ${requiredEnergy}`);

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
            `[Certificate #${certificate.id}] Transferring to demand #${demand.id} owned by ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        try {
            const fillTx = await demand.fill(certificate.id);

            return fillTx.status;
        } catch (e) {
            this.logger.error(`[Certificate #${certificate.id}] Transferring failed with ${e}`);
        }

        return false;
    }

    private async isAlreadyTransferred(certificate: Certificate.ICertificate, owner: string) {
        const syncedCertificate = await certificate.sync();

        if (certificate.owner.toLowerCase() === owner.toLowerCase()) {
            this.logger.info(
                `[Certificate #${syncedCertificate.id}] Already transferred to request demand owner ${owner}`
            );
            return true;
        }

        return false;
    }
}
