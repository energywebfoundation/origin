import certificates from './Certificates';
import producingAssets from '../features/producingAssets/reducer';
import consumingAssets from './ConsumingAsset';
import demands from './Demand';
import configuration from './Configuration';
import general from '../features/general/reducer';
import contracts from '../features/contracts/reducer';
import users from '../features/users/reducer';
import { combineReducers } from 'redux';
import { IStoreState } from '../types';
import { connectRouter } from 'connected-react-router';

export const createRootReducer = history =>
    combineReducers<IStoreState>({
        certificates,
        producingAssets,
        consumingAssets,
        demands,
        general,
        configuration,
        contracts,
        users,
        router: connectRouter(history)
    });
