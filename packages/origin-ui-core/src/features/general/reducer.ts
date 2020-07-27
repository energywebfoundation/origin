import { IOriginConfiguration, IOffChainDataSource } from '@energyweb/origin-backend-core';
import { GeneralActions, IGeneralAction, IEnvironment } from './actions';
import { IExchangeClient } from '../../utils/exchange';

export interface IGeneralState {
    loading: boolean;
    error: string;
    offChainDataSource: IOffChainDataSource;
    environment: IEnvironment;
    exchangeClient: IExchangeClient;
    offChainConfiguration: IOriginConfiguration;
    accountMismatchModalProperties: {
        visibility: boolean;
    };
    noAccountModalVisibility: boolean;
}

const defaultState: IGeneralState = {
    loading: true,
    error: null,
    offChainDataSource: null,
    environment: null,
    exchangeClient: null,
    offChainConfiguration: null,
    accountMismatchModalProperties: {
        visibility: false
    },
    noAccountModalVisibility: false
};

export default function reducer(state = defaultState, action: IGeneralAction): IGeneralState {
    switch (action.type) {
        case GeneralActions.setLoading:
            return {
                ...state,
                loading: action.payload
            };

        case GeneralActions.setError:
            return {
                ...state,
                error: action.payload
            };

        case GeneralActions.setOffChainDataSource:
            return {
                ...state,
                offChainDataSource: action.payload
            };

        case GeneralActions.setEnvironment:
            return {
                ...state,
                environment: action.payload
            };

        case GeneralActions.setOffchainConfiguration:
            return { ...state, offChainConfiguration: action.payload.configuration };

        case GeneralActions.setExchangeClient:
            return { ...state, exchangeClient: action.payload.exchangeClient };

        case GeneralActions.setAccountMismatchModalProperties:
            return { ...state, accountMismatchModalProperties: action.payload };

        case GeneralActions.setNoAccountModalVisibility:
            return { ...state, noAccountModalVisibility: action.payload };

        default:
            return state;
    }
}
