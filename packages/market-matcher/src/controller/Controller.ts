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

import * as Jsonschema from 'jsonschema';
import * as LogSymbols from 'log-symbols';

import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { Certificate } from '@energyweb/origin';
import { Agreement, Demand, Supply } from '@energyweb/market';
import { Configuration, TimeFrame } from '@energyweb/utils-general';

import { Matcher } from '../matcher/Matcher';
import * as Filter from '../matcher/Filter';
import { logger } from '../Logger';

export abstract class Controller {
    static validateJson(input: any, schema: any, description: string) {
        const validationResult = Jsonschema.validate(input, schema);
        if (validationResult.valid) {
            logger.verbose(`${description} file is valid ${LogSymbols.success}`);
        } else {
            const error = new Error();
            const errorAt = validationResult.errors
                .map(
                    (validationError: Jsonschema.ValidationError, index: number) =>
                        `\n${index}. error at ${JSON.stringify(validationError.instance)}`
                )
                .reduce((previous: string, current: string) => (previous += current));
            error.message = `${description} file is invalid ${LogSymbols.error} ${errorAt}`;
            throw error;
        }
    }

    agreements: Agreement.Entity[];
    demands: Demand.Entity[];
    supplies: Supply.Entity[];
    producingAssets: ProducingAsset.Entity[];
    matcherAddress: string;
    conf: Configuration.Entity;

    protected matcher: Matcher;

    setMatcher(matcher: Matcher) {
        this.matcher = matcher;
    }

    async matchTrigger(certificate: Certificate.Entity) {
        // const filteredAgreements = await Filter.filterAgreements(this, this.agreements, certificate);
        await this.matcher.match(certificate, this.agreements, this.demands);
    }

    abstract async matchAgreement(
        certificate: Certificate.Entity,
        aggreement: Agreement.Entity
    ): Promise<void>;

    abstract async matchDemand(
        certificate: Certificate.Entity,
        demand: Demand.Entity
    ): Promise<void>;

    abstract async getCurrentDataSourceTime(): Promise<number>;

    abstract start(): void;

    abstract async handleUnmatchedCertificate(certificate: Certificate.Entity): Promise<void>;

    abstract async registerProducingAsset(newAsset: ProducingAsset.Entity): Promise<void>;

    abstract async registerConsumingAsset(newAsset: ConsumingAsset.Entity): Promise<void>;

    abstract async registerAgreement(aggreement: Agreement.Entity): Promise<void>;

    abstract async registerDemand(demand: Demand.Entity): Promise<void>;

    abstract async registerSupply(supply: Supply.Entity): Promise<void>;

    abstract async removeProducingAsset(assetId: string): Promise<void>;

    abstract async removeConsumingAsset(assetId: string): Promise<void>;

    abstract async removeAgreement(agreementId: string): Promise<void>;

    abstract getProducingAsset(assetId: string): ProducingAsset.Entity;

    abstract getConsumingAsset(assetId: string): ConsumingAsset.Entity;

    abstract async createOrRefreshConsumingAsset(assetId: string): Promise<void>;

    abstract async splitCertificate(
        certificate: Certificate.Entity,
        whForFirstChils: number
    ): Promise<void>;

    abstract async getCurrentPeriod(startDate: number, timeFrame: TimeFrame): Promise<number>;

    abstract getAgreement(agreementId: string): Agreement.Entity;

    abstract getDemand(demandId: string): Demand.Entity;

    abstract getSupply(supplyId: string): Supply.Entity;
}
