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

import * as Sleep from './Sleep';
import * as Agreement from './RegisterAgreement';
import * as Date from './SetDate';
import * as ProducingAsset from './RegisterProducingAsset';
import * as Certificate from './RegisterCertificate';
import * as Demand from './RegisterDemand';
import * as Supply from './RegisterSupply';

interface IMatch {
    certificateId: string;
    agreementId: string;
    powerInW: number;
}

interface ISimulationFlow {
    flow: Array<
        | Sleep.ISleepAction
        | Agreement.IRegisterAgreementAction
        | Date.ISetDateAction
        | ProducingAsset.IRegisterProducingAssetAction
        | Certificate.IRegisterCertificateAction
        | Supply.IRegisterSupplyAction
        | Demand.IRegisterDemandAction
    >;
    matcherAddress: string;
    expectedResult: IMatch[];
}

interface IIdentifiableEntity {
    id: string;
}

export {
    Sleep,
    Agreement,
    Date,
    ProducingAsset,
    Certificate,
    Demand,
    Supply,
    IMatch,
    IIdentifiableEntity,
    ISimulationFlow
};
