import { IExchangeClient } from '../../utils/exchange';
import { IStoreState } from '../../types';
import { IEnvironment } from './actions';

export const getEnvironment = (state: IStoreState): IEnvironment =>
    state.exchangeGeneralState.environment;

export const getExchangeClient = (state: IStoreState): IExchangeClient =>
    state.exchangeGeneralState.exchangeClient;
