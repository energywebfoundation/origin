import { Agreement, Demand, Supply, PurchasableCertificate } from '@energyweb/market';

import { MatchingErrorReason } from './MatchingErrorReason';
import { Validator } from './Validator';

export class MatchableAgreement {
    constructor(public agreement: Agreement.IAgreement) {}

    public async matchesCertificate(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        supply: Supply.ISupply,
        demand: Demand.IDemand
    ) {
        const { offChainProperties } = this.agreement;

        const missingEnergyInCurrentPeriod = await demand.missingEnergyInCurrentPeriod();

        return new Validator<MatchingErrorReason>()
            .validate(
                supply.deviceId.toString() === certificate.certificate.deviceId.toString(),
                MatchingErrorReason.WRONG_ASSET_ID
            )
            .validate(missingEnergyInCurrentPeriod !== undefined, MatchingErrorReason.OUT_OF_RANGE)
            .validate(
                missingEnergyInCurrentPeriod && missingEnergyInCurrentPeriod.value > 0,
                MatchingErrorReason.PERIOD_ALREADY_FILLED
            )
            .validate(
                certificate.certificate.creationTime >= offChainProperties.start &&
                    certificate.certificate.creationTime <= offChainProperties.end,
                MatchingErrorReason.OUT_OF_RANGE
            )
            .result();
    }
}
