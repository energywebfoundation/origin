import { Controller} from '../controller/Controller';
import { logger } from '../Logger';
import * as EwOrigin from 'ew-origin-lib';
import * as EwMarket from 'ew-market-lib';
import * as EwGeneral from 'ew-utils-general-lib';

export interface FilterSpec {
        originator: string;
        start: number;
        end: number;
        demand: EwMarket.Demand.Entity;

}

export const filterAgreements = async (
    controller: Controller,
    agreements: EwMarket.Agreement.Entity[],
    certificate: EwOrigin.Certificate.Entity,
): Promise<EwMarket.Agreement.Entity[]> => {

    const filteredAgreements = [];

    for (const agreement of agreements) {
        const loggerPrefix = '[Filter/checkFit] Agreement #' + agreement.id + ' ';

        const filterSpec: FilterSpec = {
            demand: await controller.getDemand(agreement.demandId.toString()),
            end: agreement.offChainProperties.ende,
            // TODO: includ originator in demand
            originator: null,
            start: agreement.offChainProperties.start,
        };

        if (await checkFit(controller, loggerPrefix, filterSpec, certificate)) {
            filteredAgreements.push(agreement);
        }
    }

    logger.verbose(filteredAgreements.length + ' from ' +
        agreements.length + ' are a possible fit for certificate #' + certificate.id);
    return filteredAgreements;
};

const checkProperty = (spec: any, real: any, loggerPrefix: string, propertyName: string): boolean => {

    if (spec !== null && spec !== undefined) {
        const output = spec === real;
        logger.debug(loggerPrefix + propertyName + ' equals specification: ' + output +
            ' spec: ' + spec.toString() + ', asset: ' + real.toString());
        return output;

    } else {
        logger.debug(loggerPrefix + propertyName + ' is not specified.');
        return true;
    }

};

const checkFit = async (
    controller: Controller,
    loggerPrefix: string,
    filterSpec: FilterSpec ,
    certificate: EwOrigin.Certificate.Entity,
): Promise<boolean> => {

    let fit = true;
    const currentTime = await controller.getCurrentDataSourceTime();
    const asset = await controller.getProducingAsset(certificate.assetId.toString());

    logger.debug(loggerPrefix
        + 'originator: ' + filterSpec.originator  + ', '
        + 'asset type: ' + filterSpec.demand.offChainProperties.assettype + ', '
        + 'compliance: ' + filterSpec.demand.offChainProperties.registryCompliance + ', '
        + 'country ' + filterSpec.demand.offChainProperties.locationCountry + ', '
        + 'region: ' + filterSpec.demand.offChainProperties.locationRegion + ', '
        + 'producing asset: ' + filterSpec.demand.offChainProperties.productingAsset,
    );

    if (filterSpec.end < currentTime || filterSpec.start > currentTime) {

        fit = false;
        logger.debug(loggerPrefix + 'is outdated. (current time: ' + currentTime + ', start time: '
            + filterSpec.start + ', end time: ' + filterSpec.end);
    }

    fit = fit &&
        checkProperty(
            filterSpec.originator,
            asset.owner,
            loggerPrefix,
            'originator',
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.assettype,
            asset.offChainProperties.assetType,
            loggerPrefix,
            'asset type',
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.registryCompliance,
            asset.offChainProperties.complianceRegistry,
            loggerPrefix,
            'compliance',
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.locationCountry,
            asset.offChainProperties.country,
            loggerPrefix,
            'country',
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.locationRegion,
            asset.offChainProperties.region,
            loggerPrefix,
            'region',
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.productingAsset,
            asset.id,
            loggerPrefix,
            'producing asset id',
        );

    logger.debug(loggerPrefix + (fit ? 'does' : 'does not') + ' fit with asset ' + asset.id + '.');

    return fit;

};
