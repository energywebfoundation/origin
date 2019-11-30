import { IStoreState } from '../types';

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getDemands = (state: IStoreState) => state.demands;

export const getProducingDevices = (state: IStoreState) => state.producingDevices.producingDevices;

export const getConsumingDevices = (state: IStoreState) => state.consumingDevices;

export const getBaseURL = () => {
    return '';
};
