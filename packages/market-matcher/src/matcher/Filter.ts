// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import { Controller } from '../controller/Controller';
import { logger } from '../Logger';
import { Certificate } from '@energyweb/origin';
import { Agreement, Demand } from '@energyweb/market';

export interface IFilterSpec {
    originator: string;
    start: number;
    end: number;
    demand: Demand.Entity;
}

export const filterAgreements = async (
    controller: Controller,
    agreements: Agreement.Entity[],
    certificate: Certificate.Entity
): Promise<Agreement.Entity[]> => {
    const filteredAgreements = [];

    for (const agreement of agreements) {
        const loggerPrefix = `[Filter/checkFit] Agreement #${agreement.id}`;

        const filterSpec: IFilterSpec = {
            demand: controller.getDemand(agreement.demandId.toString()),
            end: agreement.offChainProperties.end,
            // TODO: includ originator in demand
            originator: null,
            start: agreement.offChainProperties.start
        };

        if (await checkFit(controller, loggerPrefix, filterSpec, certificate)) {
            filteredAgreements.push(agreement);
        }
    }

    logger.verbose(
        `${filteredAgreements.length} from ${agreements.length} are a possible fit for certificate #${certificate.id}`
    );

    return filteredAgreements;
};

const checkProperty = (
    spec: any,
    real: any,
    loggerPrefix: string,
    propertyName: string
): boolean => {
    if (spec !== null && spec !== undefined) {
        const output = spec === real;
        logger.debug(
            `${loggerPrefix}${propertyName} equals specification: ${output} spec: ${spec.toString()}, asset: ${real.toString()}`
        );

        return output;
    } else {
        logger.debug(`${loggerPrefix}${propertyName} is not specified.`);

        return true;
    }
};

const checkFit = async (
    controller: Controller,
    loggerPrefix: string,
    filterSpec: IFilterSpec,
    certificate: Certificate.Entity
): Promise<boolean> => {
    let fit = true;
    const currentTime = await controller.getCurrentDataSourceTime();
    const asset = controller.getProducingAsset(certificate.assetId.toString());

    logger.debug(
        `${loggerPrefix}originator: ${filterSpec.originator}, asset type: ${filterSpec.demand.offChainProperties.assettype}, compliance: ${filterSpec.demand.offChainProperties.registryCompliance}, country ${filterSpec.demand.offChainProperties.locationCountry}, region: ${filterSpec.demand.offChainProperties.locationRegion}, producing asset: ${filterSpec.demand.offChainProperties.productingAsset}`
    );

    if (filterSpec.end < currentTime || filterSpec.start > currentTime) {
        fit = false;
        logger.debug(
            `${loggerPrefix}is outdated. (current time: ${currentTime}, start time: ${filterSpec.start}, end time: ${filterSpec.end}`
        );
    }

    fit =
        fit &&
        checkProperty(filterSpec.originator, asset.owner, loggerPrefix, 'originator') &&
        checkProperty(
            filterSpec.demand.offChainProperties.assettype,
            asset.offChainProperties.assetType,
            loggerPrefix,
            'asset type'
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.registryCompliance,
            asset.offChainProperties.complianceRegistry,
            loggerPrefix,
            'compliance'
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.locationCountry,
            asset.offChainProperties.country,
            loggerPrefix,
            'country'
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.locationRegion,
            asset.offChainProperties.region,
            loggerPrefix,
            'region'
        ) &&
        checkProperty(
            filterSpec.demand.offChainProperties.productingAsset,
            asset.id,
            loggerPrefix,
            'producing asset id'
        );

    logger.debug(`${loggerPrefix}${fit ? 'does' : 'does not'} fit with asset ${asset.id}.`);

    return fit;
};
