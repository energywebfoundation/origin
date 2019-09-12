import * as Winston from 'winston';
import { autoInjectable, inject } from 'tsyringe';

import { Configuration } from '@energyweb/utils-general';
import { IEntityStore } from './EntityStore';
import { Certificate } from '@energyweb/origin';
import { CertificateService } from './CertificateService';
import { Agreement, Demand } from '@energyweb/market';
import { MatchableAgreement } from './MatchableAgreement';
import { IStrategy } from './strategy/IStrategy';
import { MatchableDemand } from './MatchableDemand';

@autoInjectable()
export class Matcher {
    private matcherAddress: string;

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy?: IStrategy,
        @inject('logger') private logger?: Winston.Logger
    ) {
        entityStore.registerCertificateListener(this.match.bind(this));
        this.matcherAddress = config.blockchainProperties.activeUser.address;
    }

    public async init() {
        await this.entityStore.init();
    }

    private async match(certificate: Certificate.Entity) {
        const isEscrowAccount = certificate.escrow.some(
            escrow => escrow.toLowerCase() === this.matcherAddress.toLowerCase()
        );

        if (!isEscrowAccount) {
            this.logger.verbose(
                'This instance is not an escrow for certificate #' + certificate.id
            );
            return false;
        }

        this.logger.verbose('This instance is an escrow for certificate #' + certificate.id);

        return (
            (await this.matchWithAgreements(certificate)) ||
            (await this.matchWithDemands(certificate))
        );
    }

    private async matchWithAgreements(certificate: Certificate.Entity) {
        const agreements = this.entityStore.getAgreements();

        const matchingAgreements = await this.findMatchingAgreements(certificate, agreements);

        for (const matchingAgreement of matchingAgreements) {
            const { agreement } = matchingAgreement;
            const demand = this.entityStore.getDemandById(agreement.demandId.toString());
            const missingEnergyForPeriod = await matchingAgreement.missingEnergyForDemand(demand);

            this.logger.debug(
                `Certificate's available power ${certificate.powerInW}, missingEnergyForPeriod ${missingEnergyForPeriod}`
            );

            if (certificate.powerInW === missingEnergyForPeriod) {
                await this.certificateService.matchAgreement(certificate, agreement);
                return true;
            } else if (
                missingEnergyForPeriod > 0 &&
                certificate.powerInW > missingEnergyForPeriod
            ) {
                await this.certificateService.splitCertificate(certificate, missingEnergyForPeriod);
                return true;
            }
        }

        return false;
    }

    private async matchWithDemands(certificate: Certificate.Entity) {
        const demands = this.entityStore.getDemands();

        const matchingDemands = await this.findMatchingDemands(certificate, demands);

        for (const matchingDemand of matchingDemands) {
            const { demand } = matchingDemand;
            const requiredPower = demand.offChainProperties.targetWhPerPeriod;

            if (certificate.powerInW === requiredPower) {
                await this.certificateService.matchDemand(certificate, demand);
                return true;
            } else if (requiredPower > 0 && certificate.powerInW > requiredPower) {
                await this.certificateService.splitCertificate(certificate, requiredPower);
                return true;
            }
        }

        return false;
    }

    private async findMatchingAgreements(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<MatchableAgreement[]> {
        this.logger.debug(`Scanning ${agreements.length} agreements for a match.`);

        const matchingAgreements = await Promise.all(
            agreements
                .map(a => new MatchableAgreement(a, this.config))
                .filter(a => a.matchesCertificate(certificate))
        );

        if (matchingAgreements.length === 0) {
            this.logger.info('Found no matching agreement for certificate #' + certificate.id);

            return [];
        }

        return this.strategy.execute(matchingAgreements);
    }

    private async findMatchingDemands(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<MatchableDemand[]> {
        this.logger.debug(`Scanning ${demands.length} demands for a match.`);

        return Promise.all(
            demands
                .map(demand => new MatchableDemand(demand))
                .filter(matchableDemand => matchableDemand.matchesCertificate(certificate))
        );
    }
}
