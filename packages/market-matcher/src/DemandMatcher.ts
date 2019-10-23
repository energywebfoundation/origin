import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

import { CertificateService } from './CertificateService';
import { IEntityStore } from './EntityStore';
import { MatchableDemand } from './MatchableDemand';
import { reasonsToString } from './MatchingErrorReason';
import { IStrategy } from './strategy/IStrategy';

@injectable()
export class DemandMatcher {
    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('certificateService') private certificateService: CertificateService,
        @inject('strategy') private strategy: IStrategy,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public async match(demand: Demand.Entity) {
        try {
            this.logger.verbose(`[Demand #${demand.id}] Started matching with certificates`);

            const certificates = await this.findMatchingCertificates(demand);

            let matched = false;

            for (const certificate of certificates) {
                const matchingResult = await this.certificateService.executeMatching(
                    certificate,
                    demand,
                    false
                );
                if (matchingResult) {
                    matched = true;
                    break;
                }
            }
            this.logger.info(`[Demand #${demand.id}] Completed processing with result ${matched}`);

            return matched;
        } catch (e) {
            this.logger.error(`[Demand #${demand.id}] Processing failed with ${e.message}`);
        }

        return true;
    }

    private async findMatchingCertificates(demand: Demand.Entity) {
        const matchableDemand = new MatchableDemand(demand);

        const certificates = await Promise.all(
            this.entityStore
                .getCertificates()
                .filter(certificate => certificate.forSale)
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
