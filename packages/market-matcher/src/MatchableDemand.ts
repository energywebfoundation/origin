import { Certificate } from '@energyweb/origin';
import { Currency, Configuration, IRECAssetService } from '@energyweb/utils-general';
import { Demand, Supply } from '@energyweb/market';
import { ProducingAsset } from '@energyweb/asset-registry';

export enum MatchingErrorReason {
    NON_ACTIVE_DEMAND,
    NOT_ENOUGH_ENERGY,
    TOO_EXPENSIVE,
    NON_MATCHING_CURRENCY,
    NON_MATCHING_ASSET_TYPE
}

export class MatchableDemand {
    private assetService = new IRECAssetService();

    constructor(public demand: Demand.IDemand) {}

    public matchesCertificate(
        certificate: Certificate.ICertificate,
        producingAsset: ProducingAsset.IProducingAsset
    ) {
        const isOffChainSettlement = Number(certificate.acceptedToken) === 0x0;

        //TODO: move to certificate entity code
        const certCurrency: Currency = isOffChainSettlement
            ? certificate.offChainSettlementOptions.currency
            : certificate.acceptedToken;
        const certPricePerMwh: number =
            ((isOffChainSettlement
                ? certificate.offChainSettlementOptions.price
                : certificate.onChainDirectPurchasePrice) /
                certificate.powerInW) *
            1e6;

        const { offChainProperties } = this.demand;
        const matchingErrors: MatchingErrorReason[] = [];

        if (!this.isActive) {
            matchingErrors.push(MatchingErrorReason.NON_ACTIVE_DEMAND);
        }

        if (offChainProperties.targetWhPerPeriod > Number(certificate.powerInW)) {
            matchingErrors.push(MatchingErrorReason.NOT_ENOUGH_ENERGY);
        }

        if (certPricePerMwh > offChainProperties.maxPricePerMwh) {
            matchingErrors.push(MatchingErrorReason.TOO_EXPENSIVE);
        }

        if (certCurrency != offChainProperties.currency) {
            matchingErrors.push(MatchingErrorReason.NON_MATCHING_CURRENCY);
        }

        if (
            !this.assetService.includesAssetType(
                producingAsset.offChainProperties.assetType,
                offChainProperties.assetType
            )
        ) {
            matchingErrors.push(MatchingErrorReason.NON_MATCHING_ASSET_TYPE);
        }

        return { result: matchingErrors.length === 0, reason: matchingErrors };
    }

    public matchesSupply(supply: Supply.Entity) {
        const supplyPricePerMwh =
            (supply.offChainProperties.price / supply.offChainProperties.availableWh) * 1e6;

        const { offChainProperties } = this.demand;

        return (
            this.isActive &&
            offChainProperties.targetWhPerPeriod <= supply.offChainProperties.availableWh &&
            supplyPricePerMwh <= offChainProperties.maxPricePerMwh
        );
    }

    private get isActive() {
        return this.demand.status === Demand.DemandStatus.ACTIVE;
    }
}
