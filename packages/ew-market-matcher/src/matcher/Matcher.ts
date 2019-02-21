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

import * as EwOrigin from 'ew-origin-lib';
import * as EwMarket from 'ew-market-lib';
import { Controller } from '../controller/Controller';
import { logger } from '../Logger';

export abstract class Matcher {
    protected controller: Controller;

    abstract async findMatchingAgreement(
        certificate: EwOrigin.Certificate.Entity,
        agreements: EwMarket.Agreement.Entity[],
    ): Promise<{split: boolean, agreement: EwMarket.Agreement.Entity}>;

    abstract async findMatchingDemand(
        certificate: EwOrigin.Certificate.Entity,
        demands: EwMarket.Demand.Entity[],
    ): Promise<EwMarket.Demand.Entity>;

    async match(
        certificate: EwOrigin.Certificate.Entity,
        agreements: EwMarket.Agreement.Entity[],
        demands: EwMarket.Demand.Entity[],
    ): Promise<boolean> {

        const matcherAccount = certificate.escrow.find((escrow: any) =>
            escrow.toLowerCase() === this.controller.matcherAddress.toLowerCase(),
        );

        if (!matcherAccount) {
            logger.verbose(' This instance is not an escrow for certificate #' + certificate.id);

        } else {
            logger.verbose('This instance is an escrow for certificate #' + certificate.id);

            const result = await this.findMatchingAgreement(certificate, agreements);
            if (result.agreement) {
                await this.controller.matchAggrement(certificate, result.agreement);
                return true;

            } else if (!result.split) {
                await this.controller.handleUnmatchedCertificate(certificate);
            }

            // const demand = await this.findMatchingDemand(certificate, demands);
            // if (demand) {
            //     await this.controller.matchDemand(certificate, demand);
            //     return true;
            // }
        }


        return false;

    }

    abstract setController(controller: Controller): void;
}
