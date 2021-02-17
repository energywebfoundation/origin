import { ICoreState } from '../../types';

export const getProducingDevices = (state: ICoreState) =>
    state.producingDevicesState.producingDevices;
