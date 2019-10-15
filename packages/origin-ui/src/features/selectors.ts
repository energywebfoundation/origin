import { IStoreState } from '../types';

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getDemands = (state: IStoreState) => state.demands;

export const getProducingAssets = (state: IStoreState) => state.producingAssets.producingAssets;

export const getConsumingAssets = (state: IStoreState) => state.consumingAssets;

export const getBaseURL = () => {
    return '';
};
