import { ComposedPublicDevice, ComposedDevice, CreateDeviceData } from '../../types';

export enum DevicesActions {
    fetchPublicDevices = 'IREC_APP_FETCH_PUBLIC_DEVICES',
    fetchMyDevices = 'IREC_APP_FETCH_MY_DEVICES',
    storePublicDevices = 'IREC_APP_STORE_PUBLIC_DEVICES',
    storeMyDevices = 'IREC_APP_STORE_MY_DEVICES',
    createDevice = 'IREC_APP_CREATE_DEVICE',
    updateDeviceStatus = 'IREC_APP_UPDATE_DEVICE_STATUS'
}
export interface IDevicesAction {
    type: DevicesActions;
    payload?;
}

export const fetchPublicDevices = (): IDevicesAction => ({
    type: DevicesActions.fetchPublicDevices
});

export const fetchMyDevices = (): IDevicesAction => ({
    type: DevicesActions.fetchMyDevices
});

export interface IStorePublicDevices {
    type: DevicesActions.storePublicDevices;
    payload: ComposedPublicDevice[];
}
export const storePublicDevices = (payload: IStorePublicDevices['payload']) => ({
    type: DevicesActions.storePublicDevices,
    payload
});

export interface IStoreMyDevices {
    type: DevicesActions.storePublicDevices;
    payload: ComposedDevice[];
}
export const storeMyDevices = (payload: IStoreMyDevices['payload']) => ({
    type: DevicesActions.storeMyDevices,
    payload
});

export interface ICreateDevice {
    type: DevicesActions.createDevice;
    payload: CreateDeviceData;
}
export const createDevice = (payload: ICreateDevice['payload']) => ({
    type: DevicesActions.createDevice,
    payload
});
