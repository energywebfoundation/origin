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
        @inject("config") private config: Configuration.Entity,
        @inject("entityStore") private entityStore: IEntityStore,
        @inject("certificateService") private certificateService: CertificateService,
        @inject("strategy") private strategy?: IStrategy,
        @inject("logger") private logger?: Winston.Logger
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

        const { agreement } = await this.findMatchingAgreement(certificate, agreements);

        if (!agreement) {
            return false;
        }

        await this.certificateService.matchAgreement(certificate, agreement);
        return true;
    }

    private async matchWithDemands(certificate: Certificate.Entity) {
        const demands = this.entityStore.getDemands();

        const { demand } = await this.findMatchingDemand(certificate, demands);

        if (!demand) {
            return false;
        }

        await this.certificateService.matchDemand(certificate, demand);
        return true;
    }

    private async findMatchingAgreement(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<{ split: boolean; agreement: Agreement.Entity }> {
        this.logger.debug(`Scanning ${agreements.length} agreements for a match.`);

        const matchingAgreements = await Promise.all(
            agreements
                .map(a => new MatchableAgreement(a, this.config))
                .filter(a => a.matchesCertificate(certificate))
        );

        if (matchingAgreements.length === 0) {
            this.logger.info('Found no matching agreement for certificate #' + certificate.id);

            return { split: false, agreement: null };
        }

        const processedMatchingAgreements = await this.strategy.execute(matchingAgreements);

        this.logger.debug(
            `Processed agreement list for certificate #${
                certificate.id
            }: ${processedMatchingAgreements.reduce(
                (accumulator: string, currentValue: MatchableAgreement) =>
                    (accumulator += currentValue.agreement.id + ' '),
                ''
            )}`
        );

        for (const matchingAgreement of processedMatchingAgreements) {
            const { agreement } = matchingAgreement;
            const demand = this.entityStore.getDemandById(agreement.demandId.toString());
            const missingEnergyForPeriod = await matchingAgreement.missingEnergyForDemand(demand);

            if (certificate.powerInW > missingEnergyForPeriod) {
                this.logger.debug(
                    `Certificate ${certificate.id} too large (${certificate.powerInW})` +
                        `for agreement ${agreement.id} (${missingEnergyForPeriod})`
                );
                if (missingEnergyForPeriod > 0) {
                    //TODO: handle splitting
                    await this.certificateService.splitCertificate(
                        certificate,
                        missingEnergyForPeriod
                    );

                    return { split: true, agreement: null };
                }
            } else {
                return { split: false, agreement };
            }
        }

        this.logger.verbose('No matching agreement found for certificate ' + certificate.id);

        return { split: false, agreement: null };
    }

    public async findMatchingDemand(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<{ split: boolean; demand: Demand.Entity }> {
        this.logger.debug(`Scanning ${demands.length} demands for a match.`);

        const matchingDemands = await Promise.all(
            demands
                .map(demand => new MatchableDemand(demand))
                .filter(matchableDemand => matchableDemand.matchesCertificate(certificate))
        );

        if (matchingDemands.length === 0) {
            this.logger.info('Found no matching demands for certificate #' + certificate.id);

            return { split: false, demand: null };
        }

        const offeredPower = certificate.powerInW;

        for (const matchingDemand of matchingDemands) {
            const { demand } = matchingDemand;
            const requiredPower = demand.offChainProperties.targetWhPerPeriod;

            if (offeredPower === requiredPower) {
                return { split: false, demand };
            }

            this.logger.debug(
                `Certificate ${certificate.id} too large (${offeredPower}) for demand ${matchingDemand.demand.id} (${requiredPower}). Splitting...`
            );

            if (requiredPower > 0) {
                await this.certificateService.splitCertificate(certificate, requiredPower);

                return { split: true, demand: null };
            }
        }

        return { split: false, demand: null };
    }
}
