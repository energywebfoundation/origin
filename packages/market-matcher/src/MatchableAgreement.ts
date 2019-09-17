import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';

import { MatchingErrorReason } from './MatchingErrorReason';
import { Utils } from './Utils';
import { Validator } from './Validator';

export class MatchableAgreement {
    constructor(public agreement: Agreement.IAgreement) {}

    public matchesCertificate(certificate: Certificate.ICertificate, supply: Supply.ISupply) {
        const { offChainProperties } = this.agreement;

        return new Validator<MatchingErrorReason>()
            .validate(
                supply.assetId.toString() === certificate.assetId.toString(),
                MatchingErrorReason.WRONG_ASSET_ID
            )
            .validate(
                certificate.creationTime >= offChainProperties.start &&
                    certificate.creationTime <= offChainProperties.end,
                MatchingErrorReason.OUT_OF_RANGE
            )
            .result();
    }

    public async missingEnergyForDemand(demand: Demand.IDemand, config: Configuration.Entity) {
        const { start, timeFrame: timeframe } = this.agreement.offChainProperties;
        const currentPeriod = await Utils.getCurrentPeriod(start, timeframe, config);

        const { targetWhPerPeriod } = demand.offChainProperties;

        if (this.agreement.matcherOffChainProperties.currentPeriod === currentPeriod) {
            const missingEnergy =
                targetWhPerPeriod - this.agreement.matcherOffChainProperties.currentWh;

            return Math.max(missingEnergy, 0);
        }

        return targetWhPerPeriod;
    }
}
