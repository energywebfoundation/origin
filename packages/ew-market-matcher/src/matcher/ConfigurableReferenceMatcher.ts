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

import { Matcher } from './Matcher'
import { BlockchainProperties, Certificate   } from 'ewf-coo'
import { Controller } from '../controller/Controller';
import { ConfigurationFileInterpreter } from './ConfigurationFileInterpreter';
import { RuleConf, SimpleHierarchyRule, SimpleHierarchyRelevantProperty } from '../schemas/RuleConf';
import { logger } from '..';
import { DemandData } from '../schemas/simulation-flow/RegisterDemand';


export class ConfigurableReferenceMatcher extends Matcher {

    private blockchainProperties: BlockchainProperties
    private conf: RuleConf
    private controller: Controller
    private propertyRanking: string[]
    
    constructor(conf: any) {
        super()
        this.conf = conf
        this.propertyRanking = ConfigurationFileInterpreter.getRanking(this.conf)
        
 
    }

    setController(controller: Controller) {
        this.controller = controller
    }


    async match(certificate: Certificate, demands: DemandData[]) {
        const sortedDemandList = demands.sort((a: DemandData, b: DemandData) => {
            // TODO: change
            const rule = (this.conf.rule as SimpleHierarchyRule)

            const unequalProperty = rule.relevantProperties
                .find((property: SimpleHierarchyRelevantProperty) => a[property.name] !== b[property.name])
            if (!unequalProperty) {
                return 0
            }

            const valueA = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, a)
            const valueB = ConfigurationFileInterpreter.getSimpleRankingMappedValue(unequalProperty, b)

            return unequalProperty.preferHigherValues ? valueB - valueA : valueA - valueB
            
        })

        logger.debug('Sorted demand list for certificate #' + certificate.id + ': '+ sortedDemandList
            .reduce((accumulator: string, currentValue: DemandData) => 
                accumulator += currentValue.id + ' ', ''))
        
        
        const filteredDemandList = []
        //TODO: split options
        for(let i = 0; i < sortedDemandList.length; i++) {
            const demand = sortedDemandList[i]
            const currentPeriod = await this.controller
                .getCurrentPeriod(demand.startTime, demand.timeframe)
            const neededWhForCurrentPeriod = demand.productionLastSetInPeriod === currentPeriod ? 
                demand.targetWhPerPeriod - demand.currentWhPerPeriod : demand.targetWhPerPeriod
                
            if(certificate.powerInW > neededWhForCurrentPeriod) {
                
                logger.debug(`Certificate ${certificate.id} to large (${certificate.powerInW}) for demand ${demand.id} (${neededWhForCurrentPeriod})` )
            } else {
                filteredDemandList.push(demand)
            }
        }

        if (filteredDemandList.length > 0) {
            await this.controller.match(certificate, filteredDemandList[0])
            
        } else {
            await this.controller.handleUnmatchedCertificate(certificate)
            logger.verbose('No match found for certificate ' + certificate.id)
        }
               
    }


}