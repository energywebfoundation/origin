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
import { Agreement, Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';

import { Controller } from '../controller/Controller';
import { METHOD_NOT_IMPLEMENTED } from '../exports';
import { Matcher } from './Matcher';

export class SimpleMatcher extends Matcher {
    public static SLEEP(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    constructor() {
        super();
    }

    public setController(controller: Controller): void {
        this.controller = controller;
    }

    public async findMatchingAgreement(
        certificate: Certificate.Entity,
        agreements: Agreement.Entity[]
    ): Promise<{ split: boolean; agreement: Agreement.Entity }> {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public async findMatchingDemand(
        certificate: Certificate.Entity,
        demands: Demand.Entity[]
    ): Promise<{ split: boolean; demand: Demand.Entity }> {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public matchDemand(certificate: Certificate.Entity, demand: Demand.Entity[]) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    public matchAgreement(certificate: Certificate.Entity, agreements: Agreement.Entity[]) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }
}
