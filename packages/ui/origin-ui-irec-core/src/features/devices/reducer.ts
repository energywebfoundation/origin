import { IDevicesAction, DevicesActions } from './actions';
import { ComposedPublicDevice, ComposedDevice } from '../../types';

export interface IIRecDevicesState {
    allDevices: ComposedPublicDevice[];
    myDevices: ComposedDevice[];
}

const initialState: IIRecDevicesState = {
    allDevices: null,
    myDevices: null
};

export function iRecDevicesState(
    state: IIRecDevicesState = initialState,
    { type, payload }: IDevicesAction
): IIRecDevicesState {
    switch (type) {
        case DevicesActions.storePublicDevices:
            return {
                ...state,
                allDevices: payload
            };
        case DevicesActions.storeMyDevices:
            return {
                ...state,
                myDevices: payload
            };
        default:
            return state;
    }
}
