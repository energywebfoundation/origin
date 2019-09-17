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

    public async matchAgreement(certificate: Certificate.Entity, agreement: Agreement.IAgreement) {
        const demand = this.entityStore.getDemandById(agreement.demandId.toString());
        if (await this.isAlreadyTransferred(certificate, demand.demandOwner)) {
            return;
        }

        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        console.log({
            id: certificate.id
        });
        await demand.fill(certificate.id);

        // TODO: update the the agreement current energy needs

        // const currentPeriod = await Utils.getCurrentPeriod(
        //     agreement.offChainProperties.start,
        //     agreement.offChainProperties.timeframe,
        //     this.config
        // );

        // if (agreement.matcherOffChainProperties.currentPeriod !== currentPeriod) {
        //     agreement.matcherOffChainProperties.currentPeriod = currentPeriod;
        //     agreement.matcherOffChainProperties.currentWh = certificate.powerInW;
        // } else {
        //     agreement.matcherOffChainProperties.currentWh += certificate.powerInW;
        // }

        // this.logger.info(`Matched certificate #${certificate.id} to agreement #${agreement.id}`);
    }

    public async splitCertificate(
        certificate: Certificate.Entity,
        requiredEnergy: number
    ): Promise<void> {
        this.logger.info(`Splitting certificate ${certificate.id} at ${requiredEnergy}`);

        await certificate.splitCertificate(requiredEnergy);
    }

    public async matchDemand(certificate: Certificate.Entity, demand: Demand.IDemand) {
        if (await this.isAlreadyTransferred(certificate, demand.demandOwner)) {
            return;
        }

        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        console.log({
            id: certificate.id
        });
        await demand.fill(certificate.id);
    }

    private async isAlreadyTransferred(certificate: Certificate.Entity, owner: string) {
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
