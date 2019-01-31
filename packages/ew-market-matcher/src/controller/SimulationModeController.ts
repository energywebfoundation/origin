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

import { ConsumingAsset, TimeFrame} from 'ewf-coo'
import { Controller} from './Controller';
import { SimulationDataSource} from '../schemas/MatcherConf';
import { logger } from '..';
import * as fs from 'fs'
import { SimulationFlowHandler } from './SimulationFlowHandler';
import * as LogSymbols from 'log-symbols'

import * as SimulationDescriptionSchema from '../schemas/simulation-description.schema.json'
import { SimulationFlow, Match } from '../schemas/simulation-flow';
import { ProducingAssetData } from '../schemas/simulation-flow/RegisterProducingAsset';
import { DemandData } from '../schemas/simulation-flow/RegisterDemand';
import { DateData } from '../schemas/simulation-flow/SetDate';
import { CertificateData } from '../schemas/simulation-flow/RegisterCertificate';




export class SimulationModeController extends Controller {

    private simulationFlow: SimulationFlow
    private matches: Match[]
    private date: number

    constructor(simulationDataSource: SimulationDataSource) {
        super()
        this.matches = []
        this.demands = []
        this.producingAssets = []
        this.date = 0
       
        this.simulationFlow = JSON.parse(fs.readFileSync(simulationDataSource.simulationFlowFile, 'utf-8'))
        Controller.validateJson(this.simulationFlow, SimulationDescriptionSchema, 'Simulation flow')
        this.matcherAddress = this.simulationFlow.matcherAddress
        logger.verbose('Loaded simulation flow file containing ' + this.simulationFlow.flow.length + ' actions' )
        logger.verbose('Set matcher address to ' + this.matcherAddress)
    }



    registerProducingAsset(newAsset: ProducingAssetData) {
        if (!this.producingAssets.find((producingAsset: ProducingAssetData) => producingAsset.id === newAsset.id)) {
            this.producingAssets.push(newAsset)
            logger.verbose('Registered new producing asset #' + newAsset.id)
        }
    }

    registerConsumingAsset(newAsset: ConsumingAsset) {
        throw new Error("Method not implemented.");
    }

    async registerDemand(newDemand: DemandData) {
        if (newDemand.matcher === this.matcherAddress) {
            if (!this.demands.find((demand: DemandData) => demand.id === newDemand.id)) {
                this.demands.push(newDemand)
                logger.verbose('Registered new demand #' + newDemand.id)
            }
        } else {
            throw new Error("Demand does not allow this matcher.")
        }
    }

    removeProducingAsset(assetId: number) {
        throw new Error("Method not implemented.");
    }

    removeConsumingAsset(assetId: number) {
        throw new Error("Method not implemented.");
    }

    getProducingAsset(assetId: number) {
        return this.producingAssets.find((asset: ProducingAssetData) => asset.id === assetId)
    }

    getConsumingAsset(assetId: number): Promise<ConsumingAsset> {
        throw new Error("Method not implemented.");
    }

    createOrRefreshConsumingAsset(assetId: number) {
        throw new Error("Method not implemented.");
    }

    getDemand(demandId: number) {
        throw new Error("Method not implemented.");
    }
  
    removeDemand(demandId: number) {
        throw new Error("Method not implemented.");
    }

    async getCurrentDataSourceTime(): Promise<number> {
        return this.date
    }

    setDataSourceTime(dateData: DateData) {
        this.date = new Date(Date.UTC(dateData.year, dateData.month - 1, dateData.day, dateData.hour, dateData.minute, dateData.second)).getTime()/1000
        logger.verbose('Set simulation time to ' + new Date(this.date * 1000).toUTCString())
    }

    handleUnmatchedCertificate(certificate: CertificateData) {
        this.matches.push({
            certificateId: certificate.id,
            demandId: -1,
            powerInW: certificate.powerInW,
            coSaved: certificate.coSaved
        })
    }


    
    async match(certificate: CertificateData, demand: DemandData) {
       
        this.matches.push({
            certificateId: certificate.id,
            demandId: demand.id,
            powerInW: certificate.powerInW,
            coSaved: certificate.coSaved
        })

        const currentPeriod = await this.getCurrentPeriod(demand.startTime, demand.timeframe)

        if (demand.productionLastSetInPeriod !== currentPeriod) {
            demand.productionLastSetInPeriod = currentPeriod
            demand.currentWhPerPeriod = certificate.powerInW
        } else {
            demand.currentWhPerPeriod += certificate.powerInW
        }
         
        logger.info('Matched certificate #' + certificate.id + ' to demand #' + demand.id)
        logger.debug(`Set Wh for Demand ${demand.id} in period ${demand.productionLastSetInPeriod} to ${demand.currentWhPerPeriod} Wh`)
    }

    async getCurrentPeriod(startDate: number, timeFrame: TimeFrame) : Promise<number> {
        switch (timeFrame) {
            case TimeFrame.yearly:
                return Math.floor((this.date - startDate) / (365 * 24 * 60 * 60))
            case TimeFrame.monthly:
                return Math.floor((this.date - startDate) / (30 * 24 * 60 * 60))
            case TimeFrame.daily:
                return Math.floor((this.date - startDate) / (24 * 60 * 60))
            case TimeFrame.hourly:
                return Math.floor((this.date - startDate) / (24 * 60 * 60))
            default:
                throw new Error("Unknown time frame" + timeFrame)
        } 
    }

    async start() {
        
        for(let i = 0; i < this.simulationFlow.flow.length; i++) {
            const action = this.simulationFlow.flow[i]
            await SimulationFlowHandler.handleFlowAction(this, action as any)
        }

        this.compareWithExpectedResults()

 

    }

    compareExpectedResultField(expectedMatch: Match, match: Match, key: string, expectedMatchIndex: number): boolean {

        if (expectedMatch[key] !== match[key]) {                     
            logger.debug(`Match #${expectedMatchIndex}: ${key} (${match[key]}) does not equal expected ${key} (${expectedMatch[key]}) ${LogSymbols.error}`)
            return false
        } else {
            return true
        }
    }

    compareWithExpectedResults() {
        let expectedResultFits = true

        logger.info('Comparing results with expected results')

        this.matches.forEach((match: Match, index: number) => {
            if (this.simulationFlow.expectedResult[index]) {
                const expectedResult = this.simulationFlow.expectedResult[index]
                const matchFits = 
                    this.compareExpectedResultField(expectedResult, match, 'coSaved', index)
                    && this.compareExpectedResultField(expectedResult, match, 'powerInW', index)
                    && this.compareExpectedResultField(expectedResult, match, 'certificateId', index)
                    && this.compareExpectedResultField(expectedResult, match, 'demandId', index)

                if (matchFits) {
                    logger.verbose('Match #' + index + ' as expected ' + LogSymbols.success)
                } else {
                    expectedResultFits = false
                    logger.verbose('Match #' + index + ' is different than expected ' + LogSymbols.error )
                }

            } else {
                expectedResultFits = false
                logger.verbose('Match was not expected ' + LogSymbols.error )
            }
        })

        if (this.simulationFlow.expectedResult.length > this.matches.length) {
            expectedResultFits = false
            logger.verbose('Expexted more matches ' + LogSymbols.error )
        }

        if (expectedResultFits) {
            logger.info('Complete match between expected results and actual results '  + LogSymbols.success)
        } else {
            logger.info('At least one result does not macht an expected result ' + LogSymbols.error )
        }
    }

}