import { IOriginConfiguration } from '@energyweb/origin-backend-core';
import { GeneralActions, IGeneralAction, IEnvironment } from './actions';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';
import { BackendClient } from '../../utils/clients/BackendClient';
import { IRecClient } from '../../utils/clients/IRecClient';

export interface IGeneralState {
    loading: boolean;
    error: string;
    backendClient: BackendClient;
    environment: IEnvironment;
    exchangeClient: ExchangeClient;
    offChainConfiguration: IOriginConfiguration;
    accountMismatchModalProperties: {
        visibility: boolean;
    };
    noAccountModalVisibility: boolean;
    iRecClient: IRecClient;
}

const defaultState: IGeneralState = {
    loading: true,
    error: null,
    backendClient: null,
    environment: null,
    exchangeClient: null,
    offChainConfiguration: null,
    accountMismatchModalProperties: {
        visibility: false
    },
    noAccountModalVisibility: false,
    iRecClient: null
};

export function generalState(state = defaultState, action: IGeneralAction): IGeneralState {
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

        case GeneralActions.setBackendClient:
            return {
                ...state,
                backendClient: action.payload
            };

        case GeneralActions.setEnvironment:
            return {
                ...state,
                environment: action.payload
            };

        case GeneralActions.setOffchainConfiguration:
            return { ...state, offChainConfiguration: action.payload.configuration };

        case GeneralActions.setExchangeClient:
            return { ...state, exchangeClient: action.payload };

        case GeneralActions.setAccountMismatchModalProperties:
            return { ...state, accountMismatchModalProperties: action.payload };

        case GeneralActions.setNoAccountModalVisibility:
            return { ...state, noAccountModalVisibility: action.payload };

        case GeneralActions.setIRecClient:
            return { ...state, iRecClient: action.payload };

        default:
            return state;
    }
}
