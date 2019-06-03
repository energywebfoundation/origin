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

import { Supply } from 'ew-market-lib';
import { IIdentifiableEntity } from '.';

export interface ISupplyData extends IIdentifiableEntity {
    offChainProperties: Supply.ISupplyOffchainProperties;
    onChainProperties: Supply.ISupplyOnChainProperties;
}

export interface IRegisterSupplyAction {
    type: RegisterSupplyActionType;
    data: ISupplyData;
}

export enum RegisterSupplyActionType {
    RegisterSupply = 'REGISTER_SUPPLY'
}

export const supplyDataToEntity = (supplyData: ISupplyData): Supply.Entity => {
    const supply = new Supply.Entity(supplyData.id, null);
    supply.offChainProperties = supplyData.offChainProperties;
    Object.keys(supplyData.onChainProperties).forEach(
        (key: string) => (supply[key] = supplyData.onChainProperties[key])
    );

    return supply;
};
