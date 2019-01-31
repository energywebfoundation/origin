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

import { Matcher } from './../Matcher/Matcher'
import * as EwAsset from 'ew-asset-registry-lib';
import { Filter } from '../matcher/Filter';
import { DemandData } from '../schemas/simulation-flow/RegisterDemand';
import { ProducingAssetData } from '../schemas/simulation-flow/RegisterProducingAsset';
import { CertificateData } from '../schemas/simulation-flow/RegisterCertificate';
import { logger } from '..';
import * as Jsonschema from 'jsonschema'
import * as LogSymbols from 'log-symbols'

export abstract class Controller {

    protected matcher: Matcher
    demands: DemandData[]
    producingAssets: ProducingAssetData[]
    matcherAddress: string

    setMatcher(matcher: Matcher) {
        this.matcher = matcher
    }

    async matchTrigger(certificate: CertificateData) {
        const filteredDemands = await Filter.filterDemands(this, this.demands, certificate)
        await this.matcher.match(certificate, filteredDemands)
    }

    abstract async match(certificate: CertificateData, demand: DemandData)

    abstract async getCurrentDataSourceTime(): Promise<number>

    abstract start()

    abstract async handleUnmatchedCertificate(certificate: CertificateData) 
    
    abstract async registerProducingAsset(newAsset: EwAsset.ProducingAsset.Entity)
  
    abstract async registerConsumingAsset(newAsset: EwAsset.ConsumingAsset.Entity) 

    abstract async registerDemand(newDemand: DemandData) 

    abstract async removeProducingAsset(assetId: number) 

    abstract async removeConsumingAsset(assetId: number)

    abstract async removeDemand(demandId: number) 

    abstract async getProducingAsset(assetId: number)

    abstract async getConsumingAsset(assetId: number): Promise<EwfCoo.ConsumingAsset>

    abstract async createOrRefreshConsumingAsset(assetId: number)

    abstract async getCurrentPeriod(startDate: number, timeFrame: EwfCoo.TimeFrame): Promise<number>
    
    abstract getDemand(demandId: number)

    static validateJson(input: any, schema: any, description: string) {
        const validationResult = Jsonschema.validate(input, schema)
        if (validationResult.valid) {
            logger.verbose(`${description} file is valid ${LogSymbols.success}`)
        } else {
            const error = new Error()
            const errorAt = validationResult.errors
                .map((validationError: Jsonschema.ValidationError, index: number) => `\n${index}. error at ${JSON.stringify(validationError.instance)}`)
                .reduce((previous: string, current: string) => previous += current)
                error.message = `${description} file is invalid ${LogSymbols.error} ${errorAt}`
            throw error

        }

    }
}
