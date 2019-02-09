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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import { Matcher } from './Matcher';
import { Controller } from '../controller/Controller';
import * as ConfigurationFileInterpreter from './ConfigurationFileInterpreter';
import * as RuleConf from '../schema-defs/RuleConf';
import { logger } from '..';
import * as EwOrigin from 'ew-origin-lib';
import * as EwMarket from 'ew-market-lib';
import * as EwGeneral from 'ew-utils-general-lib';

export class ConfigurableReferenceMatcher extends Matcher {

    private blockchainConf: EwGeneral.Configuration.Entity;
    private conf: RuleConf.RuleConf;
    private propertyRanking: string[];
    
    constructor(conf: any) {
        super();
        this.conf = conf;
        this.propertyRanking = ConfigurationFileInterpreter.getRanking(this.conf);
        
    }

    setController(controller: Controller) {
        this.controller = controller;
    }

    async findMatchingAgreement(
        certificate: EwOrigin.Certificate.Entity,
        agreements: EwMarket.Agreement.Entity[],
    ): Promise<{split: boolean, agreement: EwMarket.Agreement.Entity}> {
        
        const matchingAgreement = agreements.filter((agreement: EwMarket.Agreement.Entity) => 
            this.controller.getSupply(agreement.supplyId.toString()).assetId.toString() === 
            certificate.assetId.toString(),
        ); 

        if (matchingAgreement.length === 0) {
            logger.info('Found matching agreement for certificate #' + certificate.id);
            return {split: false, agreement: null};
        } 
  
        const sortedAgreementList = matchingAgreement
            .sort((a: EwMarket.Agreement.Entity, b: EwMarket.Agreement.Entity) => {
                // TODO: change
                const rule = (this.conf.rule as RuleConf.SimpleHierarchyRule);

                const unequalProperty = rule.relevantProperties
                    .find((property: RuleConf.SimpleHierarchyRelevantProperty) => 
                        a[property.name] !== b[property.name]
                    );
                if (!unequalProperty) {
                    return 0;
                }

                const valueA = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, a);
                const valueB = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, b);

                return unequalProperty.preferHigherValues ? valueB - valueA : valueA - valueB;
                
            });

        logger.debug('Sorted agreement list for certificate #' + certificate.id + ': ' + sortedAgreementList
            .reduce((accumulator: string, currentValue: EwMarket.Agreement.Entity) => 
                accumulator += currentValue.id + ' ', ''));
        
        const filteredAgreementList = [];

        for (const agreement of sortedAgreementList) {
            
            const currentPeriod = await this.controller
                .getCurrentPeriod(agreement.offChainProperties.start, agreement.offChainProperties.timeframe);
            const demand = await this.controller.getDemand(agreement.demandId.toString());
            const neededWhForCurrentPeriod = agreement.matcherOffChainProperties.currentPeriod === currentPeriod ? 
                demand.offChainProperties.targetWhPerPeriod - agreement.matcherOffChainProperties.currentWh :
                demand.offChainProperties.targetWhPerPeriod;
                
            if (certificate.powerInW > neededWhForCurrentPeriod) {
                logger.debug(`Certificate ${certificate.id} to large (${certificate.powerInW})` +
                    `for agreement ${agreement.id} (${neededWhForCurrentPeriod})`);
                if (neededWhForCurrentPeriod > 0) {
                    await this.controller.splitCertificate(certificate, neededWhForCurrentPeriod);
                    return {split: true, agreement: null};
                }
                
            } else {
                filteredAgreementList.push(agreement);
            }
        }

        if (filteredAgreementList.length > 0) {
            return {split: false, agreement: filteredAgreementList[0]};

        } else {
            
            logger.verbose('No matching agreement found for certificate ' + certificate.id);
            return {split: false, agreement: null};

        }
               
    }

    async findMatchingDemand(
        certificate: EwOrigin.Certificate.Entity,
        demands: EwMarket.Demand.Entity[],
    ): Promise<EwMarket.Demand.Entity> {
        throw new Error('Method not implemented.');
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
    //         const rule = (this.conf.rule as RuleConf.SimpleHierarchyRule);

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
    //         await this.controller.matchAggrement(certificate, filteredAgreementList[0]);
            
    //     } else {
            
    //         logger.verbose('Found no matching agreement for certificate ' + certificate.id);
    //         return null;
    //     }
               
    // }

}