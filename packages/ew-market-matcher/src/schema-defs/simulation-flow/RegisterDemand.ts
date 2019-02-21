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

import * as EwMarket from 'ew-market-lib';
import { IdentifiableEntity } from '.';

export interface DemandData extends IdentifiableEntity {
    offChainProperties: EwMarket.Demand.DemandOffchainproperties;
    onChainProperties: EwMarket.Demand.DemandOnChainProperties;
}

export interface RegisterDemandAction {
    type: RegisterDemandActionType;
    data: DemandData;
}

export enum RegisterDemandActionType {
    RegisterDemand = 'REGISTER_DEMAND',
}

export const demandDataToEntity = (demandData: DemandData): EwMarket.Demand.Entity => {
    const demand = new EwMarket.Demand.Entity(demandData.id, null);
    demand.offChainProperties = demandData.offChainProperties;
    Object.keys(demandData.onChainProperties)
        .forEach((key: string) => demand[key] = demandData.onChainProperties[key]);
    return demand;

};

const test: DemandData = {
    id: '99',
    offChainProperties: {
        timeframe: 0,
        pricePerCertifiedWh: 0,
        currency: 0,
        targetWhPerPeriod: 10,

    },
    onChainProperties: {
        demandOwner: '0x0',
        propertiesDocumentHash: '0x0',
        url: 'test'
    }
}
