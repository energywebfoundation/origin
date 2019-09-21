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
    private matcherAddress: string;

    private matchingQueue = new Subject();

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy: IStrategy,
        @inject('logger') private logger: Winston.Logger
    ) {
        this.matcherAddress = config.blockchainProperties.activeUser.address;
    }

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
        const requiredPower = demand.offChainProperties.targetWhPerPeriod;

        if (certificate.powerInW === requiredPower) {
            return this.certificateService.matchDemand(certificate, demand);
        }
        if (requiredPower > 0 && certificate.powerInW > requiredPower) {
            return this.certificateService.splitCertificate(certificate, requiredPower);
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
        const matchingAgreements = await this.findMatchingAgreements(certificate);

        for (const matchingAgreement of matchingAgreements) {
            const { agreement } = matchingAgreement;
            const demand = this.entityStore.getDemandById(agreement.demandId.toString());
            const missingEnergyForPeriod = await matchingAgreement.missingEnergyForDemand(demand);

            this.logger.debug(
                `Certificate's available power ${certificate.powerInW}, missingEnergyForPeriod ${missingEnergyForPeriod}`
            );

            if (certificate.powerInW === missingEnergyForPeriod) {
                return this.certificateService.matchAgreement(certificate, agreement);
            }
            if (missingEnergyForPeriod > 0 && certificate.powerInW > missingEnergyForPeriod) {
                return this.certificateService.splitCertificate(
                    certificate,
                    missingEnergyForPeriod
                );
            }
        }

        return false;
    }

    private async matchWithDemands(certificate: Certificate.ICertificate) {
        if (!this.isOnSale(certificate)) {
            this.logger.verbose(`This certificate is not on sale #${certificate.id}`);
            return false;
        }

        this.logger.info(`Checking if certificate ${certificate.id} matches any demands...`);

        const matchingDemands = await this.findMatchingDemands(certificate);

        if (!matchingDemands.length) {
            this.logger.info(
                `Couldn't find any matching demands for certificate #${certificate.id}.`
            );
        }

        for (const matchingDemand of matchingDemands) {
            const { demand } = matchingDemand;
            const matchingResult = await this.executeMatching(certificate, demand);
            if (matchingResult) {
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
                const { result } = matchableAgreement.matchesCertificate(certificate, supply);
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
            .filter(matchableDemand => {
                const { result } = matchableDemand.matchesCertificate(certificate, producingAsset);
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
