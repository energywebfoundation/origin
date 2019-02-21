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

import { Controller} from './Controller';
import { SimulationDataSource} from '../schema-defs/MatcherConf';
import { logger } from '../Logger';
import * as SimulationFlowHandler from './SimulationFlowHandler';
import * as SimulationFlowDef from '../schema-defs/simulation-flow';

import * as EwAsset from 'ew-asset-registry-lib';
import * as EwOrigin from 'ew-origin-lib';
import * as EwMarket from 'ew-market-lib';
import * as EwGeneral from 'ew-utils-general-lib';
import { initMatchingManager, initEventHandling } from './BlockchainConnection';

export class BlockchainModeController extends Controller {

    private simulationFlow: SimulationFlowDef.SimulationFlow;
    private matches: SimulationFlowDef.Match[];
    private date: number;
    private conf: EwGeneral.Configuration.Entity;

    constructor(conf: EwGeneral.Configuration.Entity, matcherAddress: string) {
        super();
        this.matches = [];
        this.agreements = [];
        this.demands = [];
        this.supplies = [];
        this.producingAssets = [];
        this.date = 0;
        this.conf = conf;
        this.matcherAddress = matcherAddress;

        logger.verbose('Set matcher address to ' + this.matcherAddress);
    }

    async registerProducingAsset(newAsset: EwAsset.ProducingAsset.Entity) {
        const producingAsset = this.producingAssets
            .find((asset: EwAsset.ProducingAsset.Entity) => asset.id === newAsset.id);

        if (!producingAsset) {
            this.producingAssets.push(newAsset);
            logger.verbose('Registered new producing asset #' + newAsset.id);
        }
    }

    async registerDemand(newDemand: EwMarket.Demand.Entity) {
        const foundDemand = this.demands
            .find((demand: EwMarket.Demand.Entity) => demand.id === newDemand.id);

        if (!foundDemand) {
            this.demands.push(newDemand);
            logger.verbose('Registered new demand #' + newDemand.id);
        }
    }

    async registerSupply(newSupply: EwMarket.Supply.Entity) {
        const foundSupply = this.supplies
            .find((supply: EwMarket.Supply.Entity) => supply.id === newSupply.id);

        if (!foundSupply) {
            this.supplies.push(newSupply);
            logger.verbose('Registered new supply #' + newSupply.id);
        }
    }

    async registerConsumingAsset(newAsset: EwAsset.ConsumingAsset.Entity) {
        throw new Error('Method not implemented.');
    }

    async registerAgreement(newAggreement: EwMarket.Agreement.Entity) {
        const allowed = newAggreement.allowedMatcher
            .find((matcherAddress: string) =>
                matcherAddress.toLowerCase() === this.matcherAddress.toLowerCase()) ? true : false;

        if (allowed) {
            if (!this.agreements.find((aggreement: EwMarket.Agreement.Entity) => newAggreement.id === aggreement.id)) {
                this.agreements.push(newAggreement);
                logger.verbose('Registered new agreement #' + newAggreement.id);
            }
        } else {
            logger.verbose('This instance is not an machter for agreement #' + newAggreement.id);
        }
    }

    async removeProducingAsset(assetId: string) {
        throw new Error('Method not implemented.');
    }

    async removeConsumingAsset(assetId: string) {
        throw new Error('Method not implemented.');
    }

    getProducingAsset(assetId: string): EwAsset.ProducingAsset.Entity {
        return this.producingAssets.find((asset: EwAsset.ProducingAsset.Entity) => asset.id === assetId);
    }

    getDemand(demandId: string): EwMarket.Demand.Entity {
        return this.demands.find((demand: EwMarket.Demand.Entity) => demand.id === demandId);
    }

    getSupply(supplyId: string): EwMarket.Supply.Entity {
        return this.supplies.find((supply: EwMarket.Supply.Entity) => supply.id === supplyId);
    }

    getConsumingAsset(assetId: string): EwAsset.ConsumingAsset.Entity {
        throw new Error('Method not implemented.');
    }

    async createOrRefreshConsumingAsset(assetId: string) {
        throw new Error('Method not implemented.');
    }

    getAgreement(agreementId: string): EwMarket.Agreement.Entity {
        throw new Error('Method not implemented.');
    }

    async removeAgreement(agreementId: string) {
        throw new Error('Method not implemented.');
    }

    async getCurrentDataSourceTime(): Promise<number> {
        return this.date;
    }

    setDataSourceTime(dateData: SimulationFlowDef.Date.DateData) {
        const theDate = Date.UTC(
            dateData.year,
            dateData.month - 1,
            dateData.day,
            dateData.hour,
            dateData.minute,
            dateData.second,
        );
        this.date = new Date(theDate).getTime() / 1000;
        logger.verbose('Set simulation time to ' + new Date(this.date * 1000).toUTCString());
    }

    async handleUnmatchedCertificate(certificate: EwOrigin.Certificate.Entity) {
        // TODO
    }

    async matchAggrement(certificate: EwOrigin.Certificate.Entity, agreement: EwMarket.Agreement.Entity) {
        const demand = this.getDemand(agreement.demandId.toString());
        logger.debug('Transfering certificate to ' + demand.demandOwner
            + ' with account ' + this.conf.blockchainProperties.activeUser.address);
        await certificate.transferFrom(demand.demandOwner);

        //TODO: set matcher props


        logger.info('Matched certificate #' + certificate.id + ' to agreement #' + agreement.id);

    }

    async splitCertificate(certificate: EwOrigin.Certificate.Entity, whForFirstChild: number): Promise<void> {

        const result = await certificate.splitCertificate(whForFirstChild);
        certificate = await certificate.sync()

        const childCertificate1 = await new EwOrigin.Certificate.Entity(certificate.children["0"], this.conf).sync()
        const childCertificate2 = await new EwOrigin.Certificate.Entity(certificate.children["1"], this.conf).sync()
        await this.matchTrigger(childCertificate1)
        await this.matchTrigger(childCertificate2)

    }

    async matchDemand(certificate: EwOrigin.Certificate.Entity, demand: EwMarket.Demand.Entity) {

        logger.info('Matched certificate #' + certificate.id + ' to demand #' + demand.id);

    }

    async getCurrentPeriod(startDate: number, timeFrame: EwGeneral.TimeFrame) : Promise<number> {
        switch (timeFrame) {
            case EwGeneral.TimeFrame.yearly:
                return Math.floor((this.date - startDate) / (365 * 24 * 60 * 60));
            case EwGeneral.TimeFrame.monthly:
                return Math.floor((this.date - startDate) / (30 * 24 * 60 * 60));
            case EwGeneral.TimeFrame.daily:
                return Math.floor((this.date - startDate) / (24 * 60 * 60));
            case EwGeneral.TimeFrame.hourly:
                return Math.floor((this.date - startDate) / (24 * 60 * 60));
            default:
                throw new Error('Unknown time frame' + timeFrame);
        }
    }

    async start() {

        await initMatchingManager(this, this.conf);
        initEventHandling(this, this.conf);

    }

}
