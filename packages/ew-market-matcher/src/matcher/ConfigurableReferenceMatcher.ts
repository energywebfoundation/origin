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

import { Certificate } from 'ew-origin-lib';
import { Agreement, Demand } from 'ew-market-lib';

import { Matcher } from './Matcher';
import { findMatchingDemandsForCertificate, findMatchingAgreementsForCertificate } from './MatcherLogic';
import { Controller } from '../controller/Controller';
import * as ConfigurationFileInterpreter from './ConfigurationFileInterpreter';
import * as RuleConf from '../schema-defs/RuleConf';
import { logger } from '../Logger';

export class ConfigurableReferenceMatcher extends Matcher {
    private ruleConf: RuleConf.IRuleConf;
    private propertyRanking: string[];

    constructor(ruleConf: RuleConf.IRuleConf) {
        super();
        this.ruleConf = ruleConf;
        this.propertyRanking = ConfigurationFileInterpreter.getRanking(this.ruleConf);
    }

    setController(controller: Controller) {
        this.controller = controller;
    }

    async findMatchingAgreement(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<{ split: boolean; agreement: Agreement.Entity }> {
        logger.debug(`Scanning ${agreements.length} agreements for a match.`);

        const matchingAgreements = await findMatchingAgreementsForCertificate(certificate, this.controller.conf, agreements);

        if (matchingAgreements.length === 0) {
            logger.info('Found no matching agreement for certificate #' + certificate.id);

            return { split: false, agreement: null };
        }

        matchingAgreements.sort(this.sortAgreements);

        logger.debug(
            `Sorted agreement list for certificate #${certificate.id}: ${matchingAgreements.reduce(
                (accumulator: string, currentValue: Agreement.Entity) =>
                    (accumulator += currentValue.id + ' '),
                ''
            )}`
        );

        const filteredAgreementList = [];

        for (const agreement of matchingAgreements) {
            const currentPeriod = await this.controller.getCurrentPeriod(
                agreement.offChainProperties.start,
                agreement.offChainProperties.timeframe
            );
            const demand = this.controller.getDemand(agreement.demandId.toString());
            const neededWhForCurrentPeriod =
                agreement.matcherOffChainProperties.currentPeriod === currentPeriod
                    ? demand.offChainProperties.targetWhPerPeriod >
                      agreement.matcherOffChainProperties.currentWh
                        ? demand.offChainProperties.targetWhPerPeriod -
                          agreement.matcherOffChainProperties.currentWh
                        : 0
                    : demand.offChainProperties.targetWhPerPeriod;

            if (
                certificate.creationTime < agreement.offChainProperties.start ||
                certificate.creationTime > agreement.offChainProperties.end
            ) {
                logger.debug(
                    `Certificate ${certificate.id} matches with agreement ${agreement.id}` +
                        ` but was created before or after the agreements timeperiod`
                );
            } else if (certificate.powerInW > neededWhForCurrentPeriod) {
                logger.debug(
                    `Certificate ${certificate.id} too large (${certificate.powerInW})` +
                        `for agreement ${agreement.id} (${neededWhForCurrentPeriod})`
                );
                if (neededWhForCurrentPeriod > 0) {
                    await this.controller.splitCertificate(certificate, neededWhForCurrentPeriod);

                    return { split: true, agreement: null };
                }
            } else {
                filteredAgreementList.push(agreement);
            }
        }

        if (filteredAgreementList.length > 0) {
            return { split: false, agreement: filteredAgreementList[0] };
        } else {
            logger.verbose('No matching agreement found for certificate ' + certificate.id);

            return { split: false, agreement: null };
        }
    }

    async findMatchingDemand(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<{ split: boolean; demand: Demand.Entity }> {
        logger.debug(`Scanning ${demands.length} demands for a match.`);

        const matchedDemands = await findMatchingDemandsForCertificate(certificate, this.controller.conf, demands);

        if (matchedDemands.length === 0) {
            logger.info('Found no matching demands for certificate #' + certificate.id);

            return { split: false, demand: null };
        }

        const offeredPower: number = Number(certificate.powerInW);

        for (const demand of matchedDemands) {
            const requiredPower: number = demand.offChainProperties.targetWhPerPeriod;

            if (offeredPower === requiredPower) {
                return { split: false, demand };
            } else if (offeredPower < requiredPower) {
                continue;
            }

            logger.debug(`Certificate ${certificate.id} too large (${offeredPower}) for demand ${demand.id} (${requiredPower}). Splitting...`);

            if (requiredPower > 0) {
                await this.controller.splitCertificate(certificate, requiredPower);

                return { split: true, demand: null };
            }
        }

        return { split: false, demand: null };
    }

    private sortAgreements(a: Agreement.Entity, b: Agreement.Entity) {
        // TODO: change
        const rule = this.ruleConf.rule as RuleConf.ISimpleHierarchyRule;

        const unequalProperty = rule.relevantProperties.find(
            (property: RuleConf.ISimpleHierarchyRelevantProperty) =>
                a[property.name] !== b[property.name]
        );
        if (!unequalProperty) {
            return 0;
        }

        const valueA = ConfigurationFileInterpreter.getSimpleRankingMappedValue(
            unequalProperty,
            a
        );
        const valueB = ConfigurationFileInterpreter.getSimpleRankingMappedValue(
            unequalProperty,
            b
        );

        return unequalProperty.preferHigherValues ? valueB - valueA : valueA - valueB;
    }

    // async match(certificate: EwOrigin.Certificate.Entity, agreements: EwMarket.Agreement.Entity[]) {

    //     const matcherAccount = certificate.escrow.find((escrow: any) =>
    //         escrow.toLowerCase() === this.controller.matcherAddress.toLowerCase(),
    //     );

    //     if (matcherAccount) {
    //         logger.verbose('This instance is an escrow for certificate #' + certificate.id);

    //     } else {
    //         logger.verbose(' This instance is not an escrow for certificate #' + certificate.id);
    //         return null;
    //     }
    //     const matchingAgreement = agreements.find((agreement: EwMarket.Agreement.Entity) => {
    //         const supply = this.controller.getSupply(agreement.supplyId.toString());
    //         return supply && supply.assetId.toString() === certificate.assetId.toString();
    //     });

    //     if (matchingAgreement) {
    //         logger.info('Found matching agreement for certificate #' + certificate.id);
    //     } else {
    //         logger.info('Found no matching agreement for certificate #' + certificate.id);
    //         //TODO: demand matching
    //         return null;
    //     }

    //     const sortedAgreementList = agreements.sort((a: EwMarket.Agreement.Entity, b: EwMarket.Agreement.Entity) => {
    //         // TODO: change
    //         const rule = (this.ruleConf.rule as RuleConf.SimpleHierarchyRule);

    //         const unequalProperty = rule.relevantProperties
    //             .find((property: RuleConf.SimpleHierarchyRelevantProperty) => a[property.name] !== b[property.name]);
    //         if (!unequalProperty) {
    //             return 0;
    //         }

    //         const valueA = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, a);
    //         const valueB = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, b);

    //         return unequalProperty.preferHigherValues ? valueB - valueA : valueA - valueB;

    //     });

    //     logger.debug('Sorted agreement list for certificate #' + certificate.id + ': ' + sortedAgreementList
    //         .reduce((accumulator: string, currentValue: EwMarket.Agreement.Entity) =>
    //             accumulator += currentValue.id + ' ',
    //             ''));

    //     const filteredAgreementList = [];
    //     // TODO: split options
    //     for (const agreement of sortedAgreementList) {

    //         const currentPeriod = await this.controller
    //             .getCurrentPeriod(agreement.offChainProperties.start, agreement.offChainProperties.timeframe);
    //         const demand = await this.controller.getDemand(agreement.demandId.toString());
    //         const neededWhForCurrentPeriod = agreement.matcherOffChainProperties.currentPeriod === currentPeriod ?
    //             demand.offChainProperties.targetWhPerPeriod - agreement.matcherOffChainProperties.currentWh :
    //             demand.offChainProperties.targetWhPerPeriod;

    //         if (certificate.powerInW > neededWhForCurrentPeriod) {

    //             logger.debug(`Certificate ${certificate.id} to large (${certificate.powerInW}) for agreement ${agreement.id} (${neededWhForCurrentPeriod})`);
    //         } else {
    //             filteredAgreementList.push(agreement);
    //         }
    //     }

    //     if (filteredAgreementList.length > 0) {
    //         await this.controller.matchAgreement(certificate, filteredAgreementList[0]);

    //     } else {

    //         logger.verbose('Found no matching agreement for certificate ' + certificate.id);
    //         return null;
    //     }

    // }
}
