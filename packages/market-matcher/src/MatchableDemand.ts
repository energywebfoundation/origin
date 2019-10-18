import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Currency, IRECAssetService, LocationService } from '@energyweb/utils-general';
import moment from 'moment';
import { Validator } from './Validator';
import { MatchingErrorReason } from './MatchingErrorReason';

export class MatchableDemand {
    private assetService = new IRECAssetService();

    private locationService = new LocationService();

    constructor(public demand: Demand.IDemand) {}

    public async matchesCertificate(
        certificate: Certificate.ICertificate,
        producingAsset: ProducingAsset.IProducingAsset
    ) {
        const isOffChainSettlement = Number(certificate.acceptedToken) === 0x0;

        // TODO: move to certificate entity code
        const certCurrency: Currency = isOffChainSettlement
            ? certificate.offChainSettlementOptions.currency
            : certificate.acceptedToken;

        const { offChainProperties } = this.demand;

        const missingEnergyInCurrentPeriod = await this.demand.missingEnergyInPeriod(
            moment().unix()
        );

        return new Validator<MatchingErrorReason>()
            .validate(this.isActive, MatchingErrorReason.NON_ACTIVE_DEMAND)
            .validate(missingEnergyInCurrentPeriod !== undefined, MatchingErrorReason.OUT_OF_RANGE)
            .validate(
                missingEnergyInCurrentPeriod && missingEnergyInCurrentPeriod.value > 0,
                MatchingErrorReason.PERIOD_ALREADY_FILLED
            )
            .validate(
                certificate.price() <= offChainProperties.maxPricePerMwh,
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
            .validate(
                this.matchesLocation(producingAsset),
                MatchingErrorReason.NON_MATCHING_LOCATION
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
                supply.offChainProperties.availableWh >= offChainProperties.energyPerTimeFrame,
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

    private matchesLocation(asset: ProducingAsset.IProducingAsset) {
        if (!this.demand.offChainProperties.location) {
            return true;
        }

        try {
            const matchableLocation = this.locationService.translateAddress(
                asset.offChainProperties.address,
                asset.offChainProperties.country
            );

            return this.locationService.matches(
                this.demand.offChainProperties.location,
                matchableLocation
            );
        } catch (e) {
            return false;
        }
    }
}
