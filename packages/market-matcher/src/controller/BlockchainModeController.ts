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
import { Configuration, TimeFrame } from '@energyweb/utils-general';

import { METHOD_NOT_IMPLEMENTED } from '../exports';
import { logger } from '../Logger';
import * as SimulationFlowDef from '../schema-defs/simulation-flow';
import { initEventHandling, initMatchingManager } from './BlockchainConnection';
import { Controller } from './Controller';

export class BlockchainModeController extends Controller {
    public conf: Configuration.Entity;

    private date: number;

    constructor(conf: Configuration.Entity, matcherAddress: string) {
        super();
        this.agreements = [];
        this.demands = [];
        this.supplies = [];
        this.producingAssets = [];
        this.date = 0;
        this.conf = conf;
        this.matcherAddress = matcherAddress;

        logger.verbose('Set matcher address to ' + this.matcherAddress);
    }

    public async registerProducingAsset(newAsset: ProducingAsset.Entity) {
        const producingAsset = this.producingAssets.some(
            (asset: ProducingAsset.Entity) => asset.id === newAsset.id
        );

        if (!producingAsset) {
            this.producingAssets.push(newAsset);
            logger.verbose('Registered new producing asset #' + newAsset.id);
        }
    }

    public async registerDemand(newDemand: Demand.Entity) {
        const foundDemand = this.demands.some(
            (demand: Demand.Entity) => demand.id === newDemand.id
        );

        if (!foundDemand) {
            this.demands.push(newDemand);
            logger.verbose('Registered new demand #' + newDemand.id);
        }
    }

    public async registerSupply(newSupply: Supply.Entity) {
        const foundSupply = this.supplies.some(
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
            (matcherAddress: string) =>
                matcherAddress && matcherAddress.toLowerCase() === this.matcherAddress.toLowerCase()
        );

        if (allowed) {
            if (
                !this.agreements.some(
                    (agreement: Agreement.Entity) => newAgreement.id === agreement.id
                )
            ) {
                this.agreements.push(newAgreement);
                logger.verbose('Registered new agreement #' + newAgreement.id);
            }
        } else {
            logger.verbose('This instance is not an matcher for agreement #' + newAgreement.id);
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
        // TODO
    }

    public async matchAgreement(certificate: Certificate.Entity, agreement: Agreement.Entity) {
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

    public async splitCertificate(
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

    public async matchDemand(certificate: Certificate.Entity, demand: Demand.Entity) {
        logger.info(`Matched certificate #${certificate.id} to demand #${demand.id}`);
        logger.debug(
            `Transferring certificate to ${demand.demandOwner} with account ${this.conf.blockchainProperties.activeUser.address}`
        );
        await certificate.transferFrom(demand.demandOwner);
    }

    public async getCurrentPeriod(startDate: number, timeFrame: TimeFrame): Promise<number> {
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

    public async start() {
        await initMatchingManager(this, this.conf);
        initEventHandling(this, this.conf);
    }
}
