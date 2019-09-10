import { Agreement, Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { TimeFrame } from '@energyweb/utils-general';

import { Controller } from '../controller/Controller';
import { logger } from '../Logger';
import { IStrategy } from '../strategy/IStrategy';
import { findMatchingAgreementsForCertificate, findMatchingDemandsForCertificate } from './MatcherLogic';

export class StrategyBasedMatcher {
    private strategy: IStrategy;
    private controller: Controller;

    constructor(strategy: IStrategy) {
        this.strategy = strategy;
    }

    public setController(controller: Controller) {
        this.controller = controller;
    }

    public async match(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[],
        demands: Demand.Entity[]
    ): Promise<boolean> {
        const matcherAccount = certificate.escrow.find(
            (escrow: any) => escrow.toLowerCase() === this.controller.matcherAddress.toLowerCase()
        );

        if (!matcherAccount) {
            logger.verbose('This instance is not an escrow for certificate #' + certificate.id);
        } else {
            logger.verbose('This instance is an escrow for certificate #' + certificate.id);

            const agreementMatchResult = await this.findMatchingAgreement(certificate, agreements);
            if (agreementMatchResult.agreement) {
                await this.controller.matchAgreement(certificate, agreementMatchResult.agreement);

                return true;
            } else if (!agreementMatchResult.split) {
                await this.controller.handleUnmatchedCertificate(certificate);
            }

            const demandMatchResult = await this.findMatchingDemand(certificate, demands);
            if (demandMatchResult.demand) {
                await this.controller.matchDemand(certificate, demandMatchResult.demand);

                return true;
            } else if (!demandMatchResult.split) {
                await this.controller.handleUnmatchedCertificate(certificate);
            }
        }

        return false;
    }

    public async findMatchingAgreement(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<{ split: boolean; agreement: Agreement.Entity }> {
        logger.debug(`Scanning ${agreements.length} agreements for a match.`);

        const matchingAgreements = await findMatchingAgreementsForCertificate(
            certificate,
            this.controller.conf,
            agreements
        );

        if (matchingAgreements.length === 0) {
            logger.info('Found no matching agreement for certificate #' + certificate.id);

            return { split: false, agreement: null };
        }

        const processedAgreements = await this.strategy.execute(matchingAgreements);

        logger.debug(
            `Processed agreement list for certificate #${
                certificate.id
            }: ${processedAgreements.reduce(
                (accumulator: string, currentValue: Agreement.Entity) =>
                    (accumulator += currentValue.id + ' '),
                ''
            )}`
        );

        const filteredAgreementList = [];

        for (const agreement of processedAgreements) {
            const { start, end, timeframe } = agreement.offChainProperties;

            if (certificate.creationTime < start || certificate.creationTime > end) {
                logger.debug(
                    `Certificate ${certificate.id} matches with agreement ${agreement.id}` +
                        ` but was created before or after the agreements time period`
                );
                continue;
            }

            const neededWhForCurrentPeriod = await this.calculateNeededEnergy(
                start,
                timeframe,
                agreement
            );

            if (certificate.powerInW > neededWhForCurrentPeriod) {
                logger.debug(
                    `Certificate ${certificate.id} too large (${certificate.powerInW})` +
                        `for agreement ${agreement.id} (${neededWhForCurrentPeriod})`
                );
                if (neededWhForCurrentPeriod > 0) {
                    await this.controller.splitCertificate(certificate, neededWhForCurrentPeriod);

                    return { split: true, agreement: null };
                }
            } else {
                filteredAgreementList.push(agreement);
            }
        }

        if (filteredAgreementList.length > 0) {
            return { split: false, agreement: filteredAgreementList[0] };
        } else {
            logger.verbose('No matching agreement found for certificate ' + certificate.id);

            return { split: false, agreement: null };
        }
    }

    public async findMatchingDemand(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<{ split: boolean; demand: Demand.Entity }> {
        logger.debug(`Scanning ${demands.length} demands for a match.`);

        const matchedDemands = await findMatchingDemandsForCertificate(
            certificate,
            this.controller.conf,
            demands
        );

        if (matchedDemands.length === 0) {
            logger.info('Found no matching demands for certificate #' + certificate.id);

            return { split: false, demand: null };
        }

        const offeredPower = certificate.powerInW;

        for (const demand of matchedDemands) {
            const requiredPower = demand.offChainProperties.targetWhPerPeriod;

            if (offeredPower < requiredPower) {
                continue;
            }

            if (offeredPower === requiredPower) {
                return { split: false, demand };
            }

            logger.debug(
                `Certificate ${certificate.id} too large (${offeredPower}) for demand ${demand.id} (${requiredPower}). Splitting...`
            );

            if (requiredPower > 0) {
                await this.controller.splitCertificate(certificate, requiredPower);

                return { split: true, demand: null };
            }
        }

        return { split: false, demand: null };
    }

    private async calculateNeededEnergy(
        start: number,
        timeFrame: TimeFrame,
        agreement: Agreement.Entity
    ) {
        const currentPeriod = await this.controller.getCurrentPeriod(start, timeFrame);
        const demand = this.controller.getDemand(agreement.demandId.toString());

        const { targetWhPerPeriod } = demand.offChainProperties;

        if (agreement.matcherOffChainProperties.currentPeriod === currentPeriod) {
            const missingEnergy = targetWhPerPeriod - agreement.matcherOffChainProperties.currentWh;

            return Math.max(missingEnergy, 0);
        }

        return targetWhPerPeriod;
    }
}
