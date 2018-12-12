import * as EwAsset from 'ew-asset-registry-lib'; 
import { Actions } from '../actions/index';

const defaultState = [];

export default function reducer(state =  defaultState, action) {

    switch(action.type) {

        case Actions.producingAssetCreatedOrUpdated:
            const index: number = state.findIndex((c: EwAsset.ProducingAsset.Entity) => c.id === action.producingAsset.id);
            return index === -1 ? 
                [...state, action.producingAsset] :
                [...state.slice(0, index),
                    action.producingAsset,
                    ...state.slice(index + 1)];

        default:
            return state;
    }
}