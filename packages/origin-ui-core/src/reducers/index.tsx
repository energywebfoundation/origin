import certificates from '../features/certificates/reducer';
import producingDevices from '../features/producingDevices/reducer';
import configuration from './Configuration';
import web3 from './Web3';
import general from '../features/general/reducer';
import users from '../features/users/reducer';
import { combineReducers } from 'redux';
import { IStoreState } from '../types';
import { connectRouter } from 'connected-react-router';
import bundles from '../features/bundles/reducer';
import orders from '../features/orders/reducer';

export const createRootReducer = (history) =>
    combineReducers<IStoreState>({
        certificates,
        producingDevices,
        general,
        configuration,
        users,
        router: connectRouter(history),
        bundles,
        orders,
        web3
    });
