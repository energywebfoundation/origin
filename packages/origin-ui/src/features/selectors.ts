import { IStoreState } from '../types';
import { getOriginContractLookupAddress } from './contracts/selectors';

export const constructBaseURL = (originContractLookupAddress: string) => {
    return `/${originContractLookupAddress}`;
};

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getDemands = (state: IStoreState) => state.demands;

export const getProducingAssets = (state: IStoreState) => state.producingAssets.producingAssets;

export const getConsumingAssets = (state: IStoreState) => state.consumingAssets;

export const getCertificates = (state: IStoreState) => state.certificates;

export const getBaseURL = (state: IStoreState) => {
    return constructBaseURL(getOriginContractLookupAddress(state));
};
