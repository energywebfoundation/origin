import { IDeviceState, IDeviceActions } from './types';
import { DevicesActions } from './actions';

const defaultState: IDeviceState = {
    allDevices: null,
    myDevices: null
};

export function devicesState(
    state = defaultState,
    { type, payload }: IDeviceActions
): IDeviceState {
    switch (type) {
        case DevicesActions.STORE_ALL_DEVICES:
            return {
                ...state,
                allDevices: payload
            };
        case DevicesActions.STORE_MY_DEVICES:
            return {
                ...state,
                myDevices: payload
            };
        case DevicesActions.CLEAR_ALL_DEVICES:
            return {
                ...state,
                allDevices: null
            };
        case DevicesActions.CLEAR_MY_DEVICES:
            return {
                ...state,
                myDevices: null
            };

        default:
            return state;
    }
}
