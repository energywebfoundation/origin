import { Web3Actions } from './actions';
import { IWeb3State } from './types';

const defaultState: IWeb3State = {
    web3: null
};

export function web3State(state = defaultState, { type, payload }) {
    switch (type) {
        case Web3Actions.web3Updated:
            return { web3: payload };

        default:
            return state;
    }
}
