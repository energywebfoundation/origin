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

import * as EwAsset from 'ew-asset-registry-lib'; 
import { Actions } from '../actions/index';

const defaultState = [];

export default function reducer(state =  defaultState, action) {

    switch (action.type) {

        case Actions.consumingAssetCreatedOrUpdated:
            const index: number = state.findIndex((c: EwAsset.ConsumingAsset.Entity) => c.id === action.consumingAsset.id);
            return index === -1 ?
                [...state,
                    action.consumingAsset] :
                [...state.slice(0,index),
                    action.consumingAsset,
                    ...state.slice(index + 1)];

        default:
            return state;
    }
}
