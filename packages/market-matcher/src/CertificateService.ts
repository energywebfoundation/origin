import { Agreement, Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { autoInjectable, inject } from 'tsyringe';
import * as Winston from 'winston';

import { IEntityStore } from './EntityStore';
import { Utils } from './Utils';

@autoInjectable()
export class CertificateService {
    constructor(
        @inject("config") private config: Configuration.Entity,
        @inject("entityStore") private entityStore: IEntityStore,
        @inject("logger") private logger: Winston.Logger
    ) {}

    public async matchAgreement(certificate: Certificate.Entity, agreement: Agreement.Entity) {
        const demand = this.entityStore.getDemandById(agreement.demandId.toString());
        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );
        await certificate.transferFrom(demand.demandOwner);

        const currentPeriod = await Utils.getCurrentPeriod(
            agreement.offChainProperties.start,
            agreement.offChainProperties.timeframe,
            this.config
        );

        if (agreement.matcherOffChainProperties.currentPeriod !== currentPeriod) {
            agreement.matcherOffChainProperties.currentPeriod = currentPeriod;
            agreement.matcherOffChainProperties.currentWh = certificate.powerInW;
        } else {
            agreement.matcherOffChainProperties.currentWh += certificate.powerInW;
        }

        this.logger.info(`Matched certificate #${certificate.id} to agreement #${agreement.id}`);
    }

    public async splitCertificate(
        certificate: Certificate.Entity,
        whForFirstChild: number
    ): Promise<void> {
        await certificate.splitCertificate(whForFirstChild);

        // certificate = await certificate.sync();

        // const childCertificate1 = await new Certificate.Entity(
        //     certificate.children['0'],
        //     this.config
        // ).sync();
        // const childCertificate2 = await new Certificate.Entity(
        //     certificate.children['1'],
        //     this.config
        // ).sync();

        // await this.matchTrigger(childCertificate1);
        // await this.matchTrigger(childCertificate2);
    }

    public async matchDemand(certificate: Certificate.Entity, demand: Demand.Entity) {
        this.logger.info(`Matched certificate #${certificate.id} to demand #${demand.id}`);
        this.logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );
        await certificate.transferFrom(demand.demandOwner);
    }
}
