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
    private controller: Controller;
    private propertyRanking: string[];
    
    constructor(conf: any) {
        super();
        this.conf = conf;
        this.propertyRanking = ConfigurationFileInterpreter.getRanking(this.conf);
        
    }

    setController(controller: Controller) {
        this.controller = controller;
    }

    async match(certificate: EwOrigin.Certificate.Entity, agreements: EwMarket.Agreement.Entity[]) {
  
        const sortedAgreementList = agreements.sort((a: EwMarket.Agreement.Entity, b: EwMarket.Agreement.Entity) => {
            // TODO: change
            const rule = (this.conf.rule as RuleConf.SimpleHierarchyRule);

            const unequalProperty = rule.relevantProperties
                .find((property: RuleConf.SimpleHierarchyRelevantProperty) => a[property.name] !== b[property.name]);
            if (!unequalProperty) {
                return 0;
            }

            const valueA = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, a);
            const valueB = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, b);

            return unequalProperty.preferHigherValues ? valueB - valueA : valueA - valueB;
            
        });

        logger.debug('Sorted agreement list for certificate #' + certificate.id + ': ' + sortedAgreementList
            .reduce((accumulator: string, currentValue: EwMarket.Agreement.Entity) => 
                accumulator += currentValue.id + ' ',
                ''));
        
        const filteredAgreementList = [];
        // TODO: split options
        for (const agreement of sortedAgreementList) {
            
            const currentPeriod = await this.controller
                .getCurrentPeriod(agreement.offChainProperties.start, agreement.offChainProperties.timeframe);
            const demand = await this.controller.getDemand(agreement.demandId.toString());
            const neededWhForCurrentPeriod = agreement.matcherOffChainProperties.currentPeriod === currentPeriod ? 
                demand.offChainProperties.targetWhPerPeriod - agreement.matcherOffChainProperties.currentWh :
                demand.offChainProperties.targetWhPerPeriod;
                
            if (certificate.powerInW > neededWhForCurrentPeriod) {
                
                logger.debug(`Certificate ${certificate.id} to large (${certificate.powerInW}) for agreement ${agreement.id} (${neededWhForCurrentPeriod})`);
            } else {
                filteredAgreementList.push(agreement);
            }
        }

        if (filteredAgreementList.length > 0) {
            await this.controller.match(certificate, filteredAgreementList[0]);
            
        } else {
            await this.controller.handleUnmatchedCertificate(certificate);
            logger.verbose('No match found for certificate ' + certificate.id);
        }
               
    }

}