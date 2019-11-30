import * as Winston from 'winston';

import { ProducingDevice } from '@energyweb/asset-registry';
import { Demand, PurchasableCertificate } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';

import { CertificateService } from './CertificateService';
import { IEntityStore } from './interface/IEntityStore';
import { MatchableDemand } from './MatchableDemand';
import { reasonsToString } from './MatchingErrorReason';
import { IStrategy } from './interface/IStrategy';

export class DemandMatcher {
    constructor(
        private config: Configuration.Entity,
        private entityStore: IEntityStore,
        private certificateService: CertificateService,
        private strategy: IStrategy,
        private logger: Winston.Logger
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
            this.logger.error(
                `[Demand #${demand.id}] Processing failed with ${e.message} ${e.stack}`
            );
        }

        return true;
    }

    private async findMatchingCertificates(demand: Demand.Entity) {
        const matchableDemand = new MatchableDemand(demand);

        const certificates = await Promise.all(
            this.entityStore
                .getCertificates()
                .filter(certificate => certificate.forSale)
                .map(async (certificate: PurchasableCertificate.Entity) => {
                    const producingDevice = await new ProducingDevice.Entity(
                        certificate.certificate.deviceId.toString(),
                        this.config
                    ).sync();

                    return { certificate, producingDevice };
                })
        );

        this.logger.verbose(
            `[Demand #${demand.id}] Found ${(certificates || []).length} certificates on-sale`
        );

        const matchingCertificates: PurchasableCertificate.IPurchasableCertificate[] = [];

        for (const { certificate, producingDevice } of certificates) {
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
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
