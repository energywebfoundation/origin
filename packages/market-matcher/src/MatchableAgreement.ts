import { Certificate } from '@energyweb/origin';
import { Agreement, Supply, Demand } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import { Utils } from './Utils';

export class MatchableAgreement {
    constructor(public agreement: Agreement.Entity, private config: Configuration.Entity) {}

    public async matchesCertificate(certificate: Certificate.Entity) {
        const supply = await new Supply.Entity(
            this.agreement.supplyId.toString(),
            this.config
        ).sync();

        const { offChainProperties } = this.agreement;

        return (
            supply.assetId.toString() === certificate.assetId.toString() &&
            certificate.creationTime >= offChainProperties.start &&
            certificate.creationTime <= offChainProperties.end
        );
    }

    public async missingEnergyForDemand(demand: Demand.Entity) {
        const { start, timeframe } = this.agreement.offChainProperties;
        const currentPeriod = await Utils.getCurrentPeriod(start, timeframe, this.config);

        const { targetWhPerPeriod } = demand.offChainProperties;

        if (this.agreement.matcherOffChainProperties.currentPeriod === currentPeriod) {
            const missingEnergy =
                targetWhPerPeriod - this.agreement.matcherOffChainProperties.currentWh;

            return Math.max(missingEnergy, 0);
        }

        return targetWhPerPeriod;
    }
}
