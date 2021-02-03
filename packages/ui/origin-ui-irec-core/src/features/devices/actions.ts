import {
    ComposedPublicDevice,
    ComposedDevice,
    CreateDeviceData,
    ChangeDeviceStatus
} from '../../types';

export enum DevicesActions {
    fetchPublicDevices = 'FETCH_PUBLIC_DEVICES',
    fetchMyDevices = 'FETCH_MY_DEVICES',
    storePublicDevices = 'STORE_PUBLIC_DEVICES',
    storeMyDevices = 'STORE_MY_DEVICES',
    createDevice = 'CREATE_DEVICE',
    updateDeviceStatus = 'UPDATE_DEVICE_STATUS'
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

export interface IUpdateDeviceStatus {
    type: DevicesActions.updateDeviceStatus;
    payload: ChangeDeviceStatus;
}
export const updateDeviceStatus = (payload: IUpdateDeviceStatus['payload']) => ({
    type: DevicesActions.updateDeviceStatus,
    payload
});
