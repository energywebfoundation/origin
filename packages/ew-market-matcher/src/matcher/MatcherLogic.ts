import { Configuration } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { Supply, Demand, Agreement } from 'ew-market-lib';

const findMatchingDemandsForCertificate = async (
    certificate: Certificate.Entity,
    conf: Configuration.Entity,
    demands?: Demand.Entity[]
): Promise<Demand.Entity[]> => {
    const certificatePower: number = Number(certificate.powerInW);

    if (!demands) {
        demands = await Demand.getAllDemands(conf);
    }

    return demands.filter(demand => demand.offChainProperties.targetWhPerPeriod >= certificatePower);
};

const findMatchingAgreementsForCertificate = async (
    certificate: Certificate.Entity,
    conf: Configuration.Entity,
    agreements?: Agreement.Entity[]
): Promise<Agreement.Entity[]> => {
    if (!agreements) {
        agreements =  await Agreement.getAllAgreements(conf);
    }

    return agreements.filter(async (agreement: Agreement.Entity) => {
        const supply = await new Supply.Entity(agreement.supplyId.toString(), conf).sync();

        return supply.assetId.toString() === certificate.assetId.toString();
    });
};

const findMatchingSuppliesForDemand = async (
    demand: Demand.Entity,
    conf: Configuration.Entity,
    supplies?: Supply.Entity[]
): Promise<Supply.Entity[]> => {
    const demandedPower: number = Number(demand.offChainProperties.targetWhPerPeriod);

    if (!supplies) {
        supplies = await Supply.getAllSupplies(conf);
    }

    return supplies.filter(supply => supply.offChainProperties.availableWh > demandedPower);
};

const findMatchingCertificatesForDemand = async (
    demand: Demand.Entity,
    conf: Configuration.Entity,
    certs?: Certificate.Entity[]
): Promise<Certificate.Entity[]> => {
    const demandedPower: number = Number(demand.offChainProperties.targetWhPerPeriod);

    if (!certs) {
        certs = await Certificate.getActiveCertificates(conf);
    }

    return certs.filter(cert => cert.powerInW > demandedPower);
};

export {
    findMatchingDemandsForCertificate,
    findMatchingSuppliesForDemand,
    findMatchingAgreementsForCertificate,
    findMatchingCertificatesForDemand
};
