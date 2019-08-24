import { ContractsActions, IContractsAction } from './actions';

export interface IContractsState {
    originContractLookupAddress: string;
}

const defaultState: IContractsState = {
    originContractLookupAddress: ''
};

export default function reducer(state = defaultState, action: IContractsAction): IContractsState {
    switch (action.type) {
        case ContractsActions.setOriginContractLookupAddress:
            return { ...state, originContractLookupAddress: action.payload };

        default:
            return state;
    }
}
