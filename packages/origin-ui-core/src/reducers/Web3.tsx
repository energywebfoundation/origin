import { Actions } from '../features/actions';

const defaultState = null;

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case Actions.web3Updated:
            return action.web3;

        default:
            return state;
    }
}
