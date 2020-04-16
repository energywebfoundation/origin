import certificates from '../features/certificates/reducer';
import producingDevices from '../features/producingDevices/reducer';
import configuration from './Configuration';
import general from '../features/general/reducer';
import contracts from '../features/contracts/reducer';
import users from '../features/users/reducer';
import { combineReducers } from 'redux';
import { IStoreState } from '../types';
import { connectRouter } from 'connected-react-router';

export const createRootReducer = (history) =>
    combineReducers<IStoreState>({
        certificates,
        producingDevices,
        general,
        configuration,
        contracts,
        users,
        router: connectRouter(history)
    });
