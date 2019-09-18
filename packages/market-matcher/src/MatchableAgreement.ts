import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';

import { MatchingErrorReason } from './MatchingErrorReason';
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

    public async missingEnergyForDemand(demand: Demand.IDemand) {
        const { targetWhPerPeriod } = demand.offChainProperties;

        return targetWhPerPeriod;
    }
}
