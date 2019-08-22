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

import { Certificate } from '@energyweb/origin';
import { Demand, Agreement } from '@energyweb/market';
import { Controller } from '../controller/Controller';
import { logger } from '../Logger';

export abstract class Matcher {
    protected controller: Controller;

    abstract async findMatchingAgreement(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<{ split: boolean; agreement: Agreement.Entity }>;

    abstract async findMatchingDemand(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<{ split: boolean; demand: Demand.Entity }>;

    async match(
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

    abstract setController(controller: Controller): void;
}
