import { ExchangeClient } from '../../utils/exchange';
import { IExchangeState } from '../../types';
import { IEnvironment } from './actions';

export const getEnvironment = (state: IExchangeState): IEnvironment =>
    state.exchangeGeneralState.environment;

export const getExchangeClient = (state: IExchangeState): ExchangeClient =>
    state.exchangeGeneralState.exchangeClient;
