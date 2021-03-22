import { IDeviceState, IDeviceActions } from './types';
import { DevicesActions } from './actions';
import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';
import { fillDevicesWithReads } from '../../utils/device';

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
        case DevicesActions.ADD_READS_ALL_DEVICES:
            const allDevicesWithReads: DeviceDTO[] = payload;
            const updatedAllDevices = fillDevicesWithReads(state.allDevices, allDevicesWithReads);
            return {
                ...state,
                allDevices: updatedAllDevices
            };
        case DevicesActions.STORE_MY_DEVICES:
            return {
                ...state,
                myDevices: payload
            };
        case DevicesActions.ADD_READS_MY_DEVICES:
            const myDevicesWithReads: DeviceDTO[] = payload;
            const updatedMyDevices = fillDevicesWithReads(state.myDevices, myDevicesWithReads);
            return {
                ...state,
                myDevices: updatedMyDevices
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
