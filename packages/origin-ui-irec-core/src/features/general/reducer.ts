import { IEnvironment } from '@energyweb/origin-ui-core';
import { DeviceClient } from '../../utils/client';
import { DeviceGeneralActions, IDeviceGeneralAction } from './actions';

export interface IIRecGeneralState {
    environment: IEnvironment;
    deviceClient: DeviceClient;
}

const initialState: IIRecGeneralState = {
    environment: null,
    deviceClient: null
};

export function iRecGeneralState<T>(
    state: IIRecGeneralState = initialState,
    { type, payload }: IDeviceGeneralAction
): IIRecGeneralState {
    switch (type) {
        case DeviceGeneralActions.SET_DEVICE_CLIENT:
            return { ...state, deviceClient: payload.deviceClient };
        case DeviceGeneralActions.SET_ENVIRONMENT:
            return { ...state, environment: payload };
        default:
            return state;
    }
}
