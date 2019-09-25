import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';

import moment from 'moment';
import { MatchingErrorReason } from './MatchingErrorReason';
import { Validator } from './Validator';

export class MatchableAgreement {
    constructor(public agreement: Agreement.IAgreement) {}

    public async matchesCertificate(
        certificate: Certificate.ICertificate,
        supply: Supply.ISupply,
        demand: Demand.IDemand
    ) {
        const { offChainProperties } = this.agreement;

        const missingEnergyInCurrentPeriod = await this.missingEnergyForDemand(demand);

        return new Validator<MatchingErrorReason>()
            .validate(
                supply.assetId.toString() === certificate.assetId.toString(),
                MatchingErrorReason.WRONG_ASSET_ID
            )
            .validate(missingEnergyInCurrentPeriod !== undefined, MatchingErrorReason.OUT_OF_RANGE)
            .validate(
                missingEnergyInCurrentPeriod && missingEnergyInCurrentPeriod.value > 0,
                MatchingErrorReason.PERIOD_ALREADY_FILLED
            )
            .validate(
                certificate.creationTime >= offChainProperties.start &&
                    certificate.creationTime <= offChainProperties.end,
                MatchingErrorReason.OUT_OF_RANGE
            )
            .result();
    }

    public async missingEnergyForDemand(demand: Demand.IDemand) {
        return demand.missingEnergyInPeriod(moment().unix());
    }
}
