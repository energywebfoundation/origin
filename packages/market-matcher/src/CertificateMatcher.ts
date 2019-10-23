import { Certificate } from '@energyweb/origin';
import { inject, injectable } from 'tsyringe';
import { Configuration } from '@energyweb/utils-general';
import * as Winston from 'winston';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { IEntityStore } from './EntityStore';
import { IStrategy } from './strategy/IStrategy';
import { CertificateService } from './CertificateService';
import { MatchableDemand } from './MatchableDemand';
import { MatchableAgreement } from './MatchableAgreement';
import { reasonsToString } from './MatchingErrorReason';

@injectable()
export class CertificateMatcher {
    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy: IStrategy,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async match(certificate: Certificate.Entity) {
        try {
            const matchingResult =
                (await this.matchWithAgreements(certificate)) ||
                (await this.matchWithDemands(certificate));

            this.logger.info(
                `[Certificate #${certificate.id}] Completed processing with result ${matchingResult}`
            );

            return matchingResult;
        } catch (e) {
            this.logger.error(
                `[Certificate #${certificate.id}] Processing certificate failed with ${e.message}`
            );
        }

        return false;
    }

    private async matchWithAgreements(certificate: Certificate.ICertificate) {
        this.logger.info(`[Certificate #${certificate.id}] Started matching with agreements`);

        const matchingAgreements = await this.findMatchingAgreements(certificate);
        const demands = await Promise.all(
            matchingAgreements.map(async ({ agreement }) =>
                this.entityStore.getDemandById(agreement.demandId.toString())
            )
        );

        return this.executeForDemands(certificate, demands, true);
    }

    private async matchWithDemands(certificate: Certificate.ICertificate) {
        this.logger.info(`[Certificate #${certificate.id}] Started matching with demands`);

        if (!certificate.forSale) {
            this.logger.verbose(`[Certificate #${certificate.id}] Not on sale. Skipping.`);
            return false;
        }

        const matchingDemands = await this.findMatchingDemands(certificate);
        const demands = matchingDemands.map(({ demand }) => demand);

        return this.executeForDemands(certificate, demands, false);
    }

    private async executeForDemands(
        certificate: Certificate.ICertificate,
        demands: Demand.IDemand[],
        fromAgreement: boolean
    ) {
        if (!demands.length) {
            return false;
        }

        for (const demand of demands) {
            const res = await this.certificateService.executeMatching(
                certificate,
                demand,
                fromAgreement
            );
            if (res) {
                return true;
            }
        }

        return false;
    }

    private async findMatchingAgreements(
        certificate: Certificate.ICertificate
    ): Promise<MatchableAgreement[]> {
        const agreements = this.entityStore
            .getAgreements()
            .map(agreement => new MatchableAgreement(agreement));

        this.logger.verbose(
            `[Certificate #${certificate.id}] Found ${(agreements || []).length} agreements`
        );

        const matchingAgreements: MatchableAgreement[] = [];

        for (const agreement of agreements) {
            const supply = await new Supply.Entity(
                agreement.agreement.supplyId.toString(),
                this.config
            ).sync();
            const demand = await new Demand.Entity(
                agreement.agreement.demandId.toString(),
                this.config
            ).sync();
            const { result, reason } = await agreement.matchesCertificate(
                certificate,
                supply,
                demand
            );

            this.logger.verbose(
                `[Certificate #${certificate.id}] Result of matching with agreement for Demand #${
                    agreement.agreement.demandId
                } and Supply #${
                    agreement.agreement.supplyId
                } is ${result} with reason ${reasonsToString(reason)}`
            );

            if (result) {
                matchingAgreements.push(agreement);
            }
        }

        this.logger.verbose(
            `[Certificate #${certificate.id}] Found ${matchingAgreements.length} matching agreements`
        );

        return this.strategy.executeForAgreements(matchingAgreements);
    }

    private async findMatchingDemands(
        certificate: Certificate.ICertificate
    ): Promise<MatchableDemand[]> {
        const producingAsset = await new ProducingAsset.Entity(
            certificate.assetId.toString(),
            this.config
        ).sync();

        const demands = this.entityStore.getDemands().map(demand => new MatchableDemand(demand));

        this.logger.verbose(
            `[Certificate #${certificate.id}] Found ${(demands || []).length} demands`
        );

        const matchingDemands: MatchableDemand[] = [];

        for (const demand of demands) {
            const { result, reason } = await demand.matchesCertificate(certificate, producingAsset);
            this.logger.verbose(
                `[Certificate #${certificate.id}] Result of matching with demand ${
                    demand.demand.id
                } is ${result} with reason ${reasonsToString(reason)}`
            );
            if (result) {
                matchingDemands.push(demand);
            }
        }

        this.logger.verbose(
            `[Certificate #${certificate.id}] Found ${matchingDemands.length} matching demands`
        );

        return matchingDemands;
    }
}
