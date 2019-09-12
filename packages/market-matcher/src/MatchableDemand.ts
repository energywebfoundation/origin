import { Certificate } from "@energyweb/origin";
import { Currency } from "@energyweb/utils-general";
import { Demand, Supply } from "@energyweb/market";

export class MatchableDemand {
  constructor(public demand: Demand.Entity) {

  }

  public matchesCertificate(certificate: Certificate.Entity) {
    const isOffChainSettlement = Number(certificate.acceptedToken) === 0x0;

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

    return (
        this.isActive &&
        offChainProperties.targetWhPerPeriod <= Number(certificate.powerInW) &&
        certPricePerMwh <= offChainProperties.maxPricePerMwh &&
        certCurrency == offChainProperties.currency
    );
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