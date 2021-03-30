import { DevicesActions, IDevicesAction } from './actions';
import { ComposedDevice, ComposedPublicDevice } from '../../types';

export interface IIRecDevicesState {
    allDevices: ComposedPublicDevice[];
    myDevices: ComposedDevice[];
    devicesToImport: ComposedDevice[];
}

const initialState: IIRecDevicesState = {
    allDevices: null,
    myDevices: null,
    devicesToImport: null
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
        case DevicesActions.storeMyIrecDevices:
            return {
                ...state,
                devicesToImport: payload
            };
        default:
            return state;
    }
}
