import { IStoreState } from '../../types';

export const getMarketContractLookupAddress = (state: IStoreState): string =>
    state.contracts.marketContractLookupAddress;

export const getCurrencies = (state: IStoreState): string[] => state.contracts.currencies;
