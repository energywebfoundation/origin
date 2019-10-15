import { ContractsActions, IContractsAction } from './actions';

export interface IContractsState {
    marketContractLookupAddress: string;
}

const defaultState: IContractsState = {
    marketContractLookupAddress: ''
};

export default function reducer(state = defaultState, action: IContractsAction): IContractsState {
    switch (action.type) {
        case ContractsActions.setMarketContractLookupAddress:
            return { ...state, marketContractLookupAddress: action.payload.address };

        default:
            return state;
    }
}
