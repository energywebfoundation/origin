import { Configuration, Currency } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { Supply, Demand, Agreement } from 'ew-market-lib';

function certificateMatchesDemand(certificate: Certificate.Entity, demand: Demand.Entity): boolean {
    const isOffChainSettlement =
        (certificate.acceptedToken as any) === '0x0000000000000000000000000000000000000000';

    const certCurrency: Currency | string = isOffChainSettlement
        ? Currency[certificate.offChainSettlementOptions.currency]
        : certificate.acceptedToken;
    const certPricePerMwh: number =
        ((isOffChainSettlement
            ? certificate.offChainSettlementOptions.price
            : certificate.onChainDirectPurchasePrice) /
            certificate.powerInW) *
        1e6;

    return (
        demand.offChainProperties.targetWhPerPeriod <= Number(certificate.powerInW) &&
        certPricePerMwh <= demand.offChainProperties.maxPricePerMwh &&
        certCurrency === Currency[demand.offChainProperties.currency.toString()]
    );
}

function supplyMatchesDemand(supply: Supply.Entity, demand: Demand.Entity): boolean {
    const supplyPricePerMwh =
        (supply.offChainProperties.price / supply.offChainProperties.availableWh) * 1e6;

    return (
        demand.offChainProperties.targetWhPerPeriod <= supply.offChainProperties.availableWh &&
        supplyPricePerMwh <= demand.offChainProperties.maxPricePerMwh
    );
}

async function findMatchingDemandsForCertificate(
    certificate: Certificate.Entity,
    conf: Configuration.Entity,
    demands?: Demand.Entity[]
): Promise<Demand.Entity[]> {
    if (!demands) {
        demands = await Demand.getAllDemands(conf);
    }

    return demands.filter(demand => certificateMatchesDemand(certificate, demand));
}

async function findMatchingCertificatesForDemand(
    demand: Demand.Entity,
    conf: Configuration.Entity,
    certs?: Certificate.Entity[]
): Promise<Certificate.Entity[]> {
    if (!certs) {
        certs = await Certificate.getActiveCertificates(conf);
    }

    return certs.filter(
        certificate => certificate.forSale && certificateMatchesDemand(certificate, demand)
    );
}

async function findMatchingAgreementsForCertificate(
    certificate: Certificate.Entity,
    conf: Configuration.Entity,
    agreements?: Agreement.Entity[]
): Promise<Agreement.Entity[]> {
    if (!agreements) {
        agreements = await Agreement.getAllAgreements(conf);
    }

    return agreements.filter(async (agreement: Agreement.Entity) => {
        const supply = await new Supply.Entity(agreement.supplyId.toString(), conf).sync();

        return supply.assetId.toString() === certificate.assetId.toString();
    });
}

async function findMatchingSuppliesForDemand(
    demand: Demand.Entity,
    conf: Configuration.Entity,
    supplies?: Supply.Entity[]
): Promise<Supply.Entity[]> {
    if (!supplies) {
        supplies = await Supply.getAllSupplies(conf);
    }

    return supplies.filter(supply => supplyMatchesDemand(supply, demand));
}

export {
    findMatchingDemandsForCertificate,
    findMatchingSuppliesForDemand,
    findMatchingAgreementsForCertificate,
    findMatchingCertificatesForDemand
};
