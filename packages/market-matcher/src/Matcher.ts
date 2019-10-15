import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

import { CertificateService } from './CertificateService';
import { IEntityStore } from './EntityStore';
import { MatchableAgreement } from './MatchableAgreement';
import { MatchableDemand } from './MatchableDemand';
import { IStrategy } from './strategy/IStrategy';

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
            this.logger.verbose(`Started processing demand #${demand.id}`);

            const matchingCertificates = await this.findMatchingCertificates(demand);
            let matched = false;

            for (const matchingCertificate of matchingCertificates) {
                const matchingResult = await this.executeMatching(matchingCertificate, demand);
                if (matchingResult) {
                    matched = true;
                    break;
                }
            }
            this.logger.verbose(`Completed processing demand #${demand.id} with result ${matched}`);

            return matched;
        } catch (e) {
            this.logger.error(`Processing demand #${demand.id} failed with ${e.message}`);
        }

        return true;
    }

    private async executeMatching(certificate: Certificate.ICertificate, demand: Demand.IDemand) {
        const { value: requiredEnergy } = await demand.missingEnergyInCurrentPeriod();

        if (certificate.energy === requiredEnergy) {
            return this.certificateService.matchDemand(certificate, demand);
        }
        if (requiredEnergy > 0 && certificate.energy > requiredEnergy) {
            return this.certificateService.splitCertificate(certificate, requiredEnergy);
        }

        return false;
    }

    private async matchCertificate(certificate: Certificate.Entity) {
        try {
            const matchingResult =
                (await this.matchWithAgreements(certificate)) ||
                (await this.matchWithDemands(certificate));

            this.logger.verbose(
                `Completed processing certificate #${certificate.id} with result ${matchingResult}`
            );

            return matchingResult;
        } catch (e) {
            this.logger.error(`Processing certificate #${certificate.id} failed with ${e.message}`);
        }

        return false;
    }

    private isOnSale(certificate: Certificate.ICertificate) {
        return certificate.forSale;
    }

    private async matchWithAgreements(certificate: Certificate.ICertificate) {
        this.logger.info(
            `Checking if certificate ${certificate.id} matches any of existing agreements...`
        );

        const matchingAgreements = await this.findMatchingAgreements(certificate);

        if (!matchingAgreements.length) {
            this.logger.info(
                `Couldn't find any matching agreements for certificate #${certificate.id}.`
            );

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
        this.logger.info(
            `Checking if certificate ${certificate.id} matches any of existing demands...`
        );

        if (!this.isOnSale(certificate)) {
            this.logger.verbose(`This certificate is not on sale #${certificate.id}`);
            return false;
        }

        const matchingDemands = await this.findMatchingDemands(certificate);

        if (!matchingDemands.length) {
            this.logger.info(
                `Couldn't find any matching demands for certificate #${certificate.id}.`
            );

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
        const matchingAgreements = this.entityStore
            .getAgreements()
            .map(agreement => new MatchableAgreement(agreement))
            .filter(async matchableAgreement => {
                const supply = await new Supply.Entity(
                    matchableAgreement.agreement.supplyId.toString(),
                    this.config
                ).sync();
                const demand = await new Demand.Entity(
                    matchableAgreement.agreement.demandId.toString(),
                    this.config
                ).sync();
                const { result } = await matchableAgreement.matchesCertificate(
                    certificate,
                    supply,
                    demand
                );
                return result;
            });

        if (matchingAgreements.length === 0) {
            this.logger.info(`Found no matching agreement for certificate #${certificate.id}`);

            return [];
        }

        return this.strategy.executeForAgreements(matchingAgreements);
    }

    private async findMatchingDemands(
        certificate: Certificate.ICertificate
    ): Promise<MatchableDemand[]> {
        const producingAsset = await new ProducingAsset.Entity(
            certificate.assetId.toString(),
            this.config
        ).sync();

        return this.entityStore
            .getDemands()
            .map(demand => new MatchableDemand(demand))
            .filter(async matchableDemand => {
                const { result } = await matchableDemand.matchesCertificate(
                    certificate,
                    producingAsset
                );
                return result;
            });
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

        const matchedCertificates = certificates
            .filter(({ certificate, producingAsset }) =>
                matchableDemand.matchesCertificate(certificate, producingAsset)
            )
            .map(({ certificate }) => certificate);

        return this.strategy.executeForCertificates(matchedCertificates);
    }
}
