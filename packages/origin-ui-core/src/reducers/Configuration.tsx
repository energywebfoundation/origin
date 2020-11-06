import { BaseActions } from '../features/actions';

const defaultState = null;

export function configurationState(state = defaultState, action) {
    switch (action.type) {
        case BaseActions.configurationUpdated:
            return action.conf;

        default:
            return state;
    }
}
