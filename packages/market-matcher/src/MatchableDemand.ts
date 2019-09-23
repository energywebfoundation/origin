import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Currency, IRECAssetService, Unit } from '@energyweb/utils-general';
import { Validator } from './Validator';
import { MatchingErrorReason } from './MatchingErrorReason';

export class MatchableDemand {
    private assetService = new IRECAssetService();

    constructor(public demand: Demand.IDemand) {}

    public matchesCertificate(
        certificate: Certificate.ICertificate,
        producingAsset: ProducingAsset.IProducingAsset
    ) {
        const isOffChainSettlement = Number(certificate.acceptedToken) === 0x0;

        // TODO: move to certificate entity code
        const certCurrency: Currency = isOffChainSettlement
            ? certificate.offChainSettlementOptions.currency
            : certificate.acceptedToken;

        const { offChainProperties } = this.demand;

        return new Validator<MatchingErrorReason>()
            .validate(this.isActive, MatchingErrorReason.NON_ACTIVE_DEMAND)
            .validate(
                offChainProperties.targetWhPerPeriod <= Number(certificate.energy),
                MatchingErrorReason.NOT_ENOUGH_ENERGY
            )
            .validate(
                certificate.pricePerUnit(Unit.MWh) <= offChainProperties.maxPricePerMwh,
                MatchingErrorReason.TOO_EXPENSIVE
            )
            .validate(
                certCurrency === offChainProperties.currency,
                MatchingErrorReason.NON_MATCHING_CURRENCY
            )
            .validate(
                this.assetService.includesAssetType(
                    producingAsset.offChainProperties.assetType,
                    offChainProperties.assetType
                ),
                MatchingErrorReason.NON_MATCHING_ASSET_TYPE
            )
            .result();
    }

    public matchesSupply(supply: Supply.ISupply) {
        const supplyPricePerMwh =
            (supply.offChainProperties.price / supply.offChainProperties.availableWh) * 1e6;

        const { offChainProperties } = this.demand;

        return new Validator<MatchingErrorReason>()
            .validate(this.isActive, MatchingErrorReason.NON_ACTIVE_DEMAND)
            .validate(
                supply.offChainProperties.availableWh >= offChainProperties.targetWhPerPeriod,
                MatchingErrorReason.NOT_ENOUGH_ENERGY
            )
            .validate(
                supplyPricePerMwh <= offChainProperties.maxPricePerMwh,
                MatchingErrorReason.TOO_EXPENSIVE
            )
            .result();
    }

    private get isActive() {
        return this.demand.status === Demand.DemandStatus.ACTIVE;
    }
}
