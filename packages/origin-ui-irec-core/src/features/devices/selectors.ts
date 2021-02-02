import { IIRecAppState, ComposedPublicDevice, ComposedDevice } from '../../types';

export const getAllDevices = (state: IIRecAppState): ComposedPublicDevice[] =>
    state.iRecDevicesState.allDevices;

export const getMyDevices = (state: IIRecAppState): ComposedDevice[] =>
    state.iRecDevicesState.myDevices;
