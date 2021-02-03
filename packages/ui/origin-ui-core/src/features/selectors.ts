import { ICoreState } from '../types';

export const getConfiguration = (state: ICoreState) => state.configurationState;

export const getProducingDevices = (state: ICoreState) =>
    state.producingDevicesState.producingDevices;

export const getBaseURL = () => {
    return '';
};

export const getWeb3 = (state: ICoreState): any => state.web3;
