import { GeneralActions, IGeneralAction, IEnvironment } from './actions';
import { IOffChainDataSource } from '@energyweb/origin-backend-client';
import { IExchangeClient } from '../../utils/exchange';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';

export interface IGeneralState {
    loading: boolean;
    error: string;
    requestPasswordModalVisible: boolean;
    requestPasswordModalTitle: string;
    requestPasswordModalCallback: (password: string) => void;
    offChainDataSource: IOffChainDataSource;
    environment: IEnvironment;
    exchangeClient: IExchangeClient;
    offChainConfiguration: IOriginConfiguration;
}

const defaultState: IGeneralState = {
    loading: true,
    error: null,
    requestPasswordModalVisible: false,
    requestPasswordModalCallback: null,
    requestPasswordModalTitle: null,
    offChainDataSource: null,
    environment: null,
    exchangeClient: null,
    offChainConfiguration: null
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

        case GeneralActions.showRequestPasswordModal:
            return {
                ...state,
                requestPasswordModalVisible: true,
                requestPasswordModalCallback: action.payload.callback,
                requestPasswordModalTitle: action.payload.title
            };

        case GeneralActions.hideRequestPasswordModal:
            return {
                ...state,
                requestPasswordModalVisible: false,
                requestPasswordModalCallback: null,
                requestPasswordModalTitle: null
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

        default:
            return state;
    }
}
