import { IStoreState } from '../types';
import { getMarketContractLookupAddress } from './contracts/selectors';

export const constructBaseURL = (marketContractLookupAddress: string) => {
    return `/${marketContractLookupAddress}`;
};

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getDemands = (state: IStoreState) => state.demands;

export const getProducingAssets = (state: IStoreState) => state.producingAssets.producingAssets;

export const getConsumingAssets = (state: IStoreState) => state.consumingAssets;

export const getBaseURL = (state: IStoreState) => {
    return constructBaseURL(getMarketContractLookupAddress(state));
};
