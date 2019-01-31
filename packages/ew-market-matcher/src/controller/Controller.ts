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

import { Matcher } from './../Matcher/Matcher';
import * as EwAsset from 'ew-asset-registry-lib';
import * as EwOrigin from 'ew-origin-lib';
import * as EwMarket from 'ew-market-lib';
import { Filter } from '../matcher/Filter';
import { logger } from '..';
import * as Jsonschema from 'jsonschema';
import * as LogSymbols from 'log-symbols';

export abstract class Controller {

    static validateJson(input: any, schema: any, description: string) {
        const validationResult = Jsonschema.validate(input, schema);
        if (validationResult.valid) {
            logger.verbose(`${description} file is valid ${LogSymbols.success}`);
        } else {
            const error = new Error();
            const errorAt = validationResult.errors
                .map((validationError: Jsonschema.ValidationError, index: number) => 
                    `\n${index}. error at ${JSON.stringify(validationError.instance)}`)
                .reduce((previous: string, current: string) => previous += current);
            error.message = `${description} file is invalid ${LogSymbols.error} ${errorAt}`;
            throw error;

        }

    }

    aggreements: EwMarket.Agreement.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    matcherAddress: string;

    protected matcher: Matcher;

    setMatcher(matcher: Matcher) {
        this.matcher = matcher;
    }

    async matchTrigger(certificate: EwOrigin.Certificate.Entity) {
        const filteredAgreements = await Filter.filterAgreements(this, this.aggreements, certificate);
        await this.matcher.match(certificate, filteredAgreements);
    }

    abstract async match(
        certificate: EwOrigin.Certificate.Entity,
        aggreement: EwMarket.Agreement.Entity,
    ): Promise<void>;

    abstract async getCurrentDataSourceTime(): Promise<number>;

    abstract start(): void;

    abstract async handleUnmatchedCertificate(certificate: EwOrigin.Certificate.Entity): Promise<void>; 
    
    abstract async registerProducingAsset(newAsset: EwAsset.ProducingAsset.Entity): Promise<void>;
  
    abstract async registerConsumingAsset(newAsset: EwAsset.ConsumingAsset.Entity): Promise<void>; 

    abstract async registerAgreement(aggreement: EwMarket.Agreement.Entity): Promise<void>; 

    abstract async removeProducingAsset(assetId: number): Promise<void>; 

    abstract async removeConsumingAsset(assetId: number): Promise<void>;

    abstract async removeAgreement(agreementId: number): Promise<void>; 

    abstract async getProducingAsset(assetId: number): Promise<EwAsset.ProducingAsset.Entity>;

    abstract async getConsumingAsset(assetId: number): Promise<EwAsset.ConsumingAsset.Entity>;

    abstract async createOrRefreshConsumingAsset(assetId: number): Promise<void>;

    abstract async getCurrentPeriod(startDate: number, timeFrame: EwMarket.D): Promise<number>;
    
    abstract getAgreement(agreementId: number): Promise<void>;
}
