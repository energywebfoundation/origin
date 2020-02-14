import { Configuration } from '@energyweb/utils-general';
import * as Winston from 'winston';
import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, PurchasableCertificate } from '@energyweb/market';

import { IEntityStore } from './interface/IEntityStore';
import { IStrategy } from './interface/IStrategy';
import { CertificateService } from './CertificateService';
import { MatchableDemand } from './MatchableDemand';
import { reasonsToString } from './MatchingErrorReason';

export class CertificateMatcher {
    constructor(
        private config: Configuration.Entity,
        private entityStore: IEntityStore,
        private certificateService: CertificateService,
        private strategy: IStrategy,
        private logger: Winston.Logger
    ) {}

    public async match(certificate: PurchasableCertificate.Entity) {
        try {
            const matchingResult = await this.matchWithDemands(certificate);

            this.logger.info(
                `[Certificate #${certificate.id}] Completed processing with result ${matchingResult}`
            );

            return matchingResult;
        } catch (e) {
            this.logger.error(
                `[Certificate #${certificate.id}] Processing certificate failed with ${e.message} ${e.stack}`
            );
        }

        return false;
    }

    private async matchWithDemands(certificate: PurchasableCertificate.IPurchasableCertificate) {
        this.logger.info(`[Certificate #${certificate.id}] Started matching with demands`);

        if (!certificate.forSale) {
            this.logger.verbose(`[Certificate #${certificate.id}] Not on sale. Skipping.`);
            return false;
        }

        const matchingDemands = await this.findMatchingDemands(certificate);
        const demands = matchingDemands.map(({ demand }) => demand);

        return this.executeForDemands(certificate, demands);
    }

    private async executeForDemands(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        demands: Demand.IDemandEntity[]
    ) {
        if (!demands.length) {
            return false;
        }

        for (const demand of demands) {
            const res = await this.certificateService.executeMatching(certificate, demand);
            if (res) {
                return true;
            }
        }

        return false;
    }

    private async findMatchingDemands(
        certificate: PurchasableCertificate.IPurchasableCertificate
    ): Promise<MatchableDemand[]> {
        const producingDevice = await new ProducingDevice.Entity(
            certificate.certificate.deviceId.toString(),
            this.config
        ).sync();

        const demands = this.entityStore
            .getDemands()
            .map(demand => new MatchableDemand(demand, this.config.deviceTypeService));

        this.logger.verbose(
            `[Certificate #${certificate.id}] Found ${(demands || []).length} demands`
        );

        const matchingDemands: MatchableDemand[] = [];

        for (const demand of demands) {
            const { result, reason } = await demand.matchesCertificate(
                certificate,
                producingDevice
            );
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
