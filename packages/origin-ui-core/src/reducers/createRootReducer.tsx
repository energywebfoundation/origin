import { certificatesState } from '../features/certificates/reducer';
import { producingDevicesState } from '../features/producingDevices/reducer';
import { configurationState } from './Configuration';
import { generalState } from '../features/general/reducer';
import { usersState } from '../features/users/reducer';
import { combineReducers } from 'redux';
import { ICoreState } from '../types';
import { connectRouter } from 'connected-react-router';
import { web3State } from './Web3';

export const createRootReducer = (history) =>
    combineReducers<ICoreState>({
        certificatesState,
        producingDevicesState,
        generalState,
        configurationState,
        usersState,
        web3: web3State,
        router: connectRouter(history)
    });
