import { IStoreState } from '../types';

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getProducingDevices = (state: IStoreState) => state.producingDevices.producingDevices;

export const getBaseURL = () => {
    return '';
};

export const getWeb3 = (state: IStoreState) => state.web3;
