import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration, Unit } from '@energyweb/utils-general';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

import { CertificateService } from './CertificateService';
import { IEntityStore } from './EntityStore';
import { MatchableAgreement } from './MatchableAgreement';
import { MatchableDemand } from './MatchableDemand';
import { IStrategy } from './strategy/IStrategy';
import { reasonsToString } from './MatchingErrorReason';

@injectable()
export class Matcher {
    private matchingQueue = new Subject();

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy: IStrategy,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async init() {
        this.matchingQueue.pipe(concatMap(this.match.bind(this))).subscribe();
        this.entityStore.registerCertificateListener(async (certificate: Certificate.Entity) =>
            this.matchingQueue.next(certificate)
        );
        this.entityStore.registerDemandListener(async (demand: Demand.Entity) =>
            this.matchingQueue.next(demand)
        );
        await this.entityStore.init();
    }

    private async match(entity: Certificate.Entity | Demand.Entity) {
        if (entity instanceof Certificate.Entity) {
            return this.matchCertificate(entity as Certificate.Entity);
        }
        return this.matchDemand(entity as Demand.Entity);
    }

    private async matchDemand(demand: Demand.Entity) {
        try {
            this.logger.verbose(`[Demand #${demand.id}] Started matching with certificates`);

            const certificates = await this.findMatchingCertificates(demand);
            let matched = false;

            for (const certificate of certificates) {
                const matchingResult = await this.executeMatching(certificate, demand);
                if (matchingResult) {
                    matched = true;
                    break;
                }
            }
            this.logger.verbose(
                `[Demand #${demand.id}] Completed processing with result ${matched}`
            );

            return matched;
        } catch (e) {
            this.logger.error(`[Demand #${demand.id}] Processing failed with ${e.message}`);
        }

        return true;
    }

    private async executeMatching(certificate: Certificate.ICertificate, demand: Demand.IDemand) {
        this.logger.verbose(
            `[Certificate #${certificate.id}] Executing matching with demand #${demand.id}`
        );

        const { value: requiredEnergy } = await demand.missingEnergyInCurrentPeriod();

        this.logger.verbose(
            `[Certificate #${certificate.id}] Missing energy from demand #${
                demand.id
            } is ${requiredEnergy / Unit.kWh}KWh`
        );

        this.logger.verbose(
            `[Certificate #${certificate.id}] Available energy: ${certificate.energy / Unit.kWh}KWh`
        );

        if (certificate.energy <= requiredEnergy) {
            return this.certificateService.matchDemand(certificate, demand);
        }
        return this.certificateService.splitCertificate(certificate, requiredEnergy);
    }

    private async matchCertificate(certificate: Certificate.Entity) {
        try {
            const matchingResult =
                (await this.matchWithAgreements(certificate)) ||
                (await this.matchWithDemands(certificate));

            this.logger.verbose(
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

    private isOnSale(certificate: Certificate.ICertificate) {
        return certificate.forSale;
    }

    private async matchWithAgreements(certificate: Certificate.ICertificate) {
        this.logger.info(`[Certificate #${certificate.id}] Started matching with agreements`);

        const matchingAgreements = await this.findMatchingAgreements(certificate);

        if (!matchingAgreements.length) {
            return false;
        }

        const demands = await Promise.all(
            matchingAgreements.map(async ({ agreement }) =>
                this.entityStore.getDemandById(agreement.demandId.toString())
            )
        );

        for (const demand of demands) {
            const res = await this.executeMatching(certificate, demand);
            if (res) {
                return true;
            }
        }

        return false;
    }

    private async matchWithDemands(certificate: Certificate.ICertificate) {
        this.logger.info(`[Certificate #${certificate.id}] Started matching with demands`);

        if (!this.isOnSale(certificate)) {
            this.logger.verbose(`[Certificate #${certificate.id}] Not on sale. Skipping.`);
            return false;
        }

        const matchingDemands = await this.findMatchingDemands(certificate);

        if (!matchingDemands.length) {
            return false;
        }

        for (const { demand } of matchingDemands) {
            const res = await this.executeMatching(certificate, demand);
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

    private async findMatchingCertificates(demand: Demand.Entity) {
        const matchableDemand = new MatchableDemand(demand);

        const certificates = await Promise.all(
            this.entityStore
                .getCertificates()
                .filter(this.isOnSale.bind(this))
                .map(async (certificate: Certificate.Entity) => {
                    const producingAsset = await new ProducingAsset.Entity(
                        certificate.assetId.toString(),
                        this.config
                    ).sync();

                    return { certificate, producingAsset };
                })
        );

        this.logger.verbose(
            `[Demand #${demand.id}] Found ${(certificates || []).length} certificates on-sale`
        );

        const matchingCertificates: Certificate.ICertificate[] = [];

        for (const { certificate, producingAsset } of certificates) {
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );
            this.logger.verbose(
                `[Demand #${demand.id}] Result of matching with certificate ${
                    certificate.id
                } is ${result} with reason ${reasonsToString(reason)}`
            );
            if (result) {
                matchingCertificates.push(certificate);
            }
        }

        this.logger.verbose(
            `[Demand #${demand.id}] Found ${matchingCertificates.length} matching certificates`
        );

        return this.strategy.executeForCertificates(matchingCertificates);
    }
}
