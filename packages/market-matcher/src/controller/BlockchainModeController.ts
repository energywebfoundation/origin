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

import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { Certificate } from '@energyweb/origin';
import { Agreement, Demand, Supply } from '@energyweb/market';
import { Configuration, TimeFrame } from '@energyweb/utils-general';

import { Controller } from './Controller';
import { logger } from '../Logger';
import * as SimulationFlowDef from '../schema-defs/simulation-flow';
import { initMatchingManager, initEventHandling } from './BlockchainConnection';
import { METHOD_NOT_IMPLEMENTED } from '../exports';

export class BlockchainModeController extends Controller {
    public conf: Configuration.Entity;

    private simulationFlow: SimulationFlowDef.ISimulationFlow;
    private matches: SimulationFlowDef.IMatch[];
    private date: number;

    constructor(conf: Configuration.Entity, matcherAddress: string) {
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

    async registerProducingAsset(newAsset: ProducingAsset.Entity) {
        const producingAsset = this.producingAssets.find(
            (asset: ProducingAsset.Entity) => asset.id === newAsset.id
        );

        if (!producingAsset) {
            this.producingAssets.push(newAsset);
            logger.verbose('Registered new producing asset #' + newAsset.id);
        }
    }

    async registerDemand(newDemand: Demand.Entity) {
        const foundDemand = this.demands.find(
            (demand: Demand.Entity) => demand.id === newDemand.id
        );

        if (!foundDemand) {
            this.demands.push(newDemand);
            logger.verbose('Registered new demand #' + newDemand.id);
        }
    }

    async registerSupply(newSupply: Supply.Entity) {
        const foundSupply = this.supplies.find(
            (supply: Supply.Entity) => supply.id === newSupply.id
        );

        if (!foundSupply) {
            this.supplies.push(newSupply);
            logger.verbose('Registered new supply #' + newSupply.id);
        }
    }

    async registerConsumingAsset(newAsset: ConsumingAsset.Entity) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    async registerAgreement(newAggreement: Agreement.Entity) {
        const allowed: boolean = Boolean(
            newAggreement.allowedMatcher.find(
                (matcherAddress: string) =>
                    matcherAddress &&
                    matcherAddress.toLowerCase() === this.matcherAddress.toLowerCase()
            )
        );

        if (allowed) {
            if (
                !this.agreements.find(
                    (aggreement: Agreement.Entity) => newAggreement.id === aggreement.id
                )
            ) {
                this.agreements.push(newAggreement);
                logger.verbose('Registered new agreement #' + newAggreement.id);
            }
        } else {
            logger.verbose('This instance is not an machter for agreement #' + newAggreement.id);
        }
    }

    async removeProducingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    async removeConsumingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    getProducingAsset(assetId: string): ProducingAsset.Entity {
        return this.producingAssets.find((asset: ProducingAsset.Entity) => asset.id === assetId);
    }

    getDemand(demandId: string): Demand.Entity {
        return this.demands.find((demand: Demand.Entity) => demand.id === demandId);
    }

    getSupply(supplyId: string): Supply.Entity {
        return this.supplies.find((supply: Supply.Entity) => supply.id === supplyId);
    }

    getConsumingAsset(assetId: string): ConsumingAsset.Entity {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    async createOrRefreshConsumingAsset(assetId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    getAgreement(agreementId: string): Agreement.Entity {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    async removeAgreement(agreementId: string) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    async getCurrentDataSourceTime(): Promise<number> {
        return this.date;
    }

    setDataSourceTime(dateData: SimulationFlowDef.Date.IDateData) {
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

    async handleUnmatchedCertificate(certificate: Certificate.Entity) {
        // TODO
    }

    async matchAgreement(certificate: Certificate.Entity, agreement: Agreement.Entity) {
        const demand = this.getDemand(agreement.demandId.toString());
        logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.conf.blockchainProperties.activeUser.address}`
        );
        await certificate.transferFrom(demand.demandOwner);

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
    }

    async splitCertificate(
        certificate: Certificate.Entity,
        whForFirstChild: number
    ): Promise<void> {
        await certificate.splitCertificate(whForFirstChild);
        certificate = await certificate.sync();

        const childCertificate1 = await new Certificate.Entity(
            certificate.children['0'],
            this.conf
        ).sync();
        const childCertificate2 = await new Certificate.Entity(
            certificate.children['1'],
            this.conf
        ).sync();

        await this.matchTrigger(childCertificate1);
        await this.matchTrigger(childCertificate2);
    }

    async matchDemand(certificate: Certificate.Entity, demand: Demand.Entity) {
        logger.info(`Matched certificate #${certificate.id} to demand #${demand.id}`);
        logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.conf.blockchainProperties.activeUser.address}`
        );
        await certificate.transferFrom(demand.demandOwner);
    }

    async getCurrentPeriod(startDate: number, timeFrame: TimeFrame): Promise<number> {
        this.date = (await this.conf.blockchainProperties.web3.eth.getBlock('latest')).timestamp;
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

    async start() {
        await initMatchingManager(this, this.conf);
        initEventHandling(this, this.conf);
    }
}
