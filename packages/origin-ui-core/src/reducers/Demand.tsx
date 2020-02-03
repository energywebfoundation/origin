import { Demand } from '@energyweb/market';
import { Actions } from '../features/actions';

const defaultState = [];

function isDemandDeleted(demand: Demand.Entity) {
    return !demand || !demand.owner;
}

export default function reducer(state = defaultState, action) {
    let demandIndex;

    switch (action.type) {
        case Actions.demandCreated:
            demandIndex = state.findIndex((d: Demand.Entity) => d.id === action.demand.id);

            return demandIndex === -1 && !isDemandDeleted(action.demand)
                ? [...state, action.demand]
                : state;
        case Actions.demandUpdated:
            demandIndex = state.findIndex((d: Demand.Entity) => d.id === action.demand.id);

            return demandIndex === -1
                ? [...state, action.demand]
                : [...state.slice(0, demandIndex), action.demand, ...state.slice(demandIndex + 1)];
        default:
            return state;
    }
}
