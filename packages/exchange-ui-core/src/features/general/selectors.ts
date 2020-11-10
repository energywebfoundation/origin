import { IExchangeClient } from '../../utils/exchange';
import { IStoreState } from '../../types';

export const getEnvironment = (state: IStoreState) => state.exchangeGeneralState.environment;

export const getExchangeClient = (state: IStoreState): IExchangeClient =>
    state.exchangeGeneralState.exchangeClient;
