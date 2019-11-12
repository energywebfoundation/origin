import { Actions } from '../features/actions';

const defaultState = null;

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case Actions.configurationUpdated:
            return action.conf;

        default:
            return state;
    }
}
