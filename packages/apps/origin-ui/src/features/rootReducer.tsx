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
    supplyState
} from '@energyweb/exchange-ui-core';
import { iRecGeneralState, iRecDevicesState } from '@energyweb/origin-ui-irec-core';
import { IStoreState } from '../types';

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
        supplyState,
        web3State,
        iRecGeneralState,
        iRecDevicesState
    });
