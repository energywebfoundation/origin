import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import {
    certificatesState,
    producingDevicesState,
    configurationState,
    generalState,
    usersState,
    web3State
} from '@energyweb/origin-ui-core';
import {
    bundlesState,
    ordersState,
    exchangeGeneralState,
    IStoreState
} from '@energyweb/exchange-ui-core';

export const createRootReducer = (history) =>
    combineReducers<IStoreState>({
        certificatesState,
        producingDevicesState,
        generalState,
        configurationState,
        usersState,
        router: connectRouter(history),
        bundlesState,
        ordersState,
        exchangeGeneralState,
        web3: web3State
    });
