import * as Winston from 'winston';
import { injectable, inject } from 'tsyringe';

import { Configuration } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';
import { Agreement, Demand, Supply } from '@energyweb/market';
import { ProducingAsset } from '@energyweb/asset-registry';
import { IEntityStore } from './EntityStore';
import { CertificateService } from './CertificateService';
import { MatchableAgreement } from './MatchableAgreement';
import { IStrategy } from './strategy/IStrategy';
import { MatchableDemand } from './MatchableDemand';

@injectable()
export class Matcher {
    private matcherAddress: string;

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy: IStrategy,
        @inject('logger') private logger: Winston.Logger
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
                `This instance is not an escrow for certificate #${certificate.id}`
            );
            return false;
        }

        this.logger.verbose(`This instance is an escrow for certificate #${certificate.id}`);

        const matchingResult =
            (await this.matchWithAgreements(certificate)) ||
            (await this.matchWithDemands(certificate));

        return matchingResult;
    }

    private async matchWithAgreements(certificate: Certificate.Entity) {
        const agreements = this.entityStore.getAgreements();

        const matchingAgreements = await this.findMatchingAgreements(certificate, agreements);

        for (const matchingAgreement of matchingAgreements) {
            const { agreement } = matchingAgreement;
            const demand = this.entityStore.getDemandById(agreement.demandId.toString());
            const missingEnergyForPeriod = await matchingAgreement.missingEnergyForDemand(
                demand,
                this.config
            );

            this.logger.debug(
                `Certificate's available power ${certificate.powerInW}, missingEnergyForPeriod ${missingEnergyForPeriod}`
            );

            if (certificate.powerInW === missingEnergyForPeriod) {
                await this.certificateService.matchAgreement(certificate, agreement);
                return true;
            }
            if (missingEnergyForPeriod > 0 && certificate.powerInW > missingEnergyForPeriod) {
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
            }
            if (requiredPower > 0 && certificate.powerInW > requiredPower) {
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

        const matchingAgreements = agreements
            .map(agreement => new MatchableAgreement(agreement))
            .filter(async matchableAgreement => {
                const supply = await new Supply.Entity(
                    matchableAgreement.agreement.supplyId.toString(),
                    this.config
                ).sync();
                const { result } = matchableAgreement.matchesCertificate(certificate, supply);
                return result;
            });

        if (matchingAgreements.length === 0) {
            this.logger.info(`Found no matching agreement for certificate #${certificate.id}`);

            return [];
        }

        return this.strategy.execute(matchingAgreements);
    }

    private async findMatchingDemands(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<MatchableDemand[]> {
        this.logger.debug(`Scanning ${demands.length} demands for a match.`);
        const producingAsset = await new ProducingAsset.Entity(
            certificate.assetId.toString(),
            this.config
        ).sync();

        return demands
            .map(demand => new MatchableDemand(demand))
            .filter(matchableDemand => {
                const { result } = matchableDemand.matchesCertificate(certificate, producingAsset);
                return result;
            });
    }
}
