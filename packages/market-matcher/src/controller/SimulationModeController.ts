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
import { ConsumingAsset, ProducingAsset } from '@energyweb/asset-registry';
import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { TimeFrame } from '@energyweb/utils-general';
import * as fs from 'fs';
import * as LogSymbols from 'log-symbols';

import * as SimulationDescriptionSchema from '../../schemas/simulation-description.schema.json';
import { METHOD_NOT_IMPLEMENTED } from '../exports';
import { logger } from '../Logger';
import { ISimulationDataSource } from '../schema-defs/MatcherConf';
import * as SimulationFlowDef from '../schema-defs/simulation-flow/';
import { Controller } from './Controller';
import * as SimulationFlowHandler from './SimulationFlowHandler';

export class SimulationModeController extends Controller {
    private simulationFlow: SimulationFlowDef.ISimulationFlow;
    private matches: SimulationFlowDef.IMatch[];
    private date: number;

    constructor(simulationDataSource: ISimulationDataSource) {
        super();
        this.matches = [];
        this.agreements = [];
        this.demands = [];
        this.supplies = [];
        this.producingAssets = [];
        this.date = 0;

        this.simulationFlow = JSON.parse(
            fs.readFileSync(simulationDataSource.simulationFlowFile, 'utf-8')
        );
        Controller.validateJson(
            this.simulationFlow,
            SimulationDescriptionSchema,
            'Simulation flow'
        );
        this.matcherAddress = this.simulationFlow.matcherAddress;
        logger.verbose(
            `Loaded simulation flow file containing ${this.simulationFlow.flow.length} actions`
        );
        logger.verbose('Set matcher address to ' + this.matcherAddress);
    }

    public async registerProducingAsset(newAsset: ProducingAsset.Entity) {
        const producingAsset = this.producingAssets.find(
            (asset: ProducingAsset.Entity) => asset.id === newAsset.id
        );

        if (!producingAsset) {
            this.producingAssets.push(newAsset);
            logger.verbose('Registered new producing asset #' + newAsset.id);
        }
    }

    public async registerDemand(newDemand: Demand.Entity) {
        const foundDemand = this.demands.find(
            (demand: Demand.Entity) => demand.id === newDemand.id
        );

        if (!foundDemand) {
            this.demands.push(newDemand);
            logger.verbose('Registered new demand #' + newDemand.id);
        }
    }

    public async registerSupply(newSupply: Supply.Entity) {
        const foundSupply = this.supplies.find(
            (supply: Supply.Entity) => supply.id === newSupply.id
        );

        if (!foundSupply) {
            this.supplies.push(newSupply);
            logger.verbose('Registered new supply #' + newSupply.id);
        }
    }

    public async registerConsumingAsset(newAsset: ConsumingAsset.Entity) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async registerAgreement(newAgreement: Agreement.Entity) {
        const allowed = newAgreement.allowedMatcher.some(
            matcherAddress => matcherAddress === this.matcherAddress
        );

        if (allowed) {
            if (!this.agreements.some(agreement => newAgreement.id === agreement.id)) {
                this.agreements.push(newAgreement);
                logger.verbose('Registered new agreement #' + newAgreement.id);
            }
        } else {
            throw new Error('Agreement does not allow this matcher.');
        }
    }

    public async removeProducingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async removeConsumingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public getProducingAsset(assetId: string): ProducingAsset.Entity {
        return this.producingAssets.find((asset: ProducingAsset.Entity) => asset.id === assetId);
    }

    public getDemand(demandId: string): Demand.Entity {
        return this.demands.find((demand: Demand.Entity) => demand.id === demandId);
    }

    public getSupply(supplyId: string): Supply.Entity {
        return this.supplies.find((supply: Supply.Entity) => supply.id === supplyId);
    }

    public getConsumingAsset(assetId: string): ConsumingAsset.Entity {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async createOrRefreshConsumingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public getAgreement(agreementId: string): Agreement.Entity {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async removeAgreement(agreementId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async getCurrentDataSourceTime(): Promise<number> {
        return this.date;
    }

    public setDataSourceTime(dateData: SimulationFlowDef.Date.IDateData) {
        const theDate = Date.UTC(
            dateData.year,
            dateData.month - 1,
            dateData.day,
            dateData.hour,
            dateData.minute,
            dateData.second
        );
        this.date = new Date(theDate).getTime() / 1000;
        logger.verbose('Set simulation time to ' + new Date(this.date * 1000).toUTCString());
    }

    public async handleUnmatchedCertificate(certificate: Certificate.Entity) {
        this.matches.push({
            certificateId: certificate.id,
            agreementId: '-1',
            powerInW: certificate.powerInW
        });
    }

    public async matchAgreement(certificate: Certificate.Entity, agreement: Agreement.Entity) {
        this.matches.push({
            agreementId: agreement.id,
            certificateId: certificate.id,
            powerInW: certificate.powerInW
        });

        const currentPeriod = await this.getCurrentPeriod(
            agreement.offChainProperties.start,
            agreement.offChainProperties.timeframe
        );

        if (agreement.matcherOffChainProperties.currentPeriod !== currentPeriod) {
            agreement.matcherOffChainProperties.currentPeriod = currentPeriod;
            agreement.matcherOffChainProperties.currentWh = certificate.powerInW;
        } else {
            agreement.matcherOffChainProperties.currentWh += certificate.powerInW;
        }

        logger.info(`Matched certificate #${certificate.id} to agreement #${agreement.id}`);
        logger.debug(
            `Set Wh for Agreement ${agreement.id} in period ${agreement.matcherOffChainProperties.currentPeriod} to ${agreement.matcherOffChainProperties.currentWh} Wh`
        );
    }

    public async matchDemand(certificate: Certificate.Entity, demand: Demand.Entity) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async getCurrentPeriod(startDate: number, timeFrame: TimeFrame): Promise<number> {
        switch (timeFrame) {
            case TimeFrame.yearly:
                return Math.floor((this.date - startDate) / (365 * 24 * 60 * 60));
            case TimeFrame.monthly:
                return Math.floor((this.date - startDate) / (30 * 24 * 60 * 60));
            case TimeFrame.daily:
                return Math.floor((this.date - startDate) / (24 * 60 * 60));
            case TimeFrame.hourly:
                return Math.floor((this.date - startDate) / (24 * 60 * 60));
            default:
                throw new Error('Unknown time frame' + timeFrame);
        }
    }

    public async start() {
        for (const action of this.simulationFlow.flow) {
            await SimulationFlowHandler.handleFlowAction(this, action as any);
        }

        this.compareWithExpectedResults();
    }

    public compareExpectedResultField(
        expectedMatch: SimulationFlowDef.IMatch,
        match: SimulationFlowDef.IMatch,
        key: string,
        expectedMatchIndex: number
    ): boolean {
        if (expectedMatch[key] !== match[key]) {
            logger.debug(
                `Match #${expectedMatchIndex}: ${key} (${match[key]}) does not equal expected ${key} (${expectedMatch[key]}) ${LogSymbols.error}`
            );

            return false;
        } else {
            return true;
        }
    }

    public async splitCertificate(
        certificate: Certificate.Entity,
        whForFirstChild: number
    ): Promise<void> {
        if (certificate.powerInW < whForFirstChild) {
            throw Error('whForFirstChild can not be smaller than powerInWh');
        }

        const firstChildId = Number(certificate.id) + 1;
        const secondChildId = Number(certificate.id) + 2;

        const firstChild = Object.assign(
            new Certificate.Entity(null, certificate.configuration),
            certificate
        );
        firstChild.id = firstChildId.toString();
        firstChild.powerInW = whForFirstChild;

        const secondChild = Object.assign(
            new Certificate.Entity(null, certificate.configuration),
            certificate
        );
        secondChild.id = secondChildId.toString();
        secondChild.powerInW = certificate.powerInW - firstChild.powerInW;

        certificate.children = [firstChildId, secondChildId];
        logger.debug(`Splitting certificate #${certificate.id} with ${certificate.powerInW} wh`);
        logger.debug(`First child #${firstChild.id} with ${firstChild.powerInW} wh`);
        logger.debug(`Second child #${secondChild.id} with ${secondChild.powerInW} wh`);

        await this.matchTrigger(firstChild);
        await this.matchTrigger(secondChild);
    }

    public compareWithExpectedResults() {
        let expectedResultFits = true;

        logger.info('Comparing results with expected results');

        this.matches.forEach((match: SimulationFlowDef.IMatch, index: number) => {
            if (this.simulationFlow.expectedResult[index]) {
                const expectedResult = this.simulationFlow.expectedResult[index];
                const matchFits =
                    this.compareExpectedResultField(expectedResult, match, 'powerInW', index) &&
                    this.compareExpectedResultField(
                        expectedResult,
                        match,
                        'certificateId',
                        index
                    ) &&
                    this.compareExpectedResultField(expectedResult, match, 'agreementId', index);

                if (matchFits) {
                    logger.verbose(`Match #${index} as expected ${LogSymbols.success}`);
                } else {
                    expectedResultFits = false;
                    logger.verbose(
                        `Match #${index} is different than expected ${LogSymbols.error}`
                    );
                }
            } else {
                expectedResultFits = false;
                logger.verbose('Match was not expected ' + LogSymbols.error);
            }
        });

        if (this.simulationFlow.expectedResult.length > this.matches.length) {
            expectedResultFits = false;
            logger.verbose('Expexted more matches ' + LogSymbols.error);
        }

        if (expectedResultFits) {
            logger.info(
                'Complete match between expected results and actual results ' + LogSymbols.success
            );
        } else {
            logger.info(
                'At least one result does not macht an expected result ' + LogSymbols.error
            );
        }
    }
}
