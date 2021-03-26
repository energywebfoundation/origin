import { ComposedPublicDevice, ComposedDevice, CreateDeviceData } from '../../types';
import { DeviceDTO as IRecMyDeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-client';

export enum DevicesActions {
    fetchPublicDevices = 'IREC_APP_FETCH_PUBLIC_DEVICES',
    fetchMyDevices = 'IREC_APP_FETCH_MY_DEVICES',
    fetchDevicesToImport = 'IREC_APP_GET_DEVICES_TO_IMPORT',
    storePublicDevices = 'IREC_APP_STORE_PUBLIC_DEVICES',
    storeMyDevices = 'IREC_APP_STORE_MY_DEVICES',
    storeMyIrecDevices = 'IREC_APP_STORE_MY_IREC_DEVICES',
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

export const fetchDevicesToImport = (): IDevicesAction => ({
    type: DevicesActions.fetchDevicesToImport
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
    type: DevicesActions.storeMyDevices;
    payload: ComposedDevice[];
}
export const storeMyDevices = (payload: IStoreMyDevices['payload']) => ({
    type: DevicesActions.storeMyDevices,
    payload
});

export interface IStoreIrecDevicesToImport {
    type: DevicesActions.storeMyIrecDevices;
    payload: IRecMyDeviceDTO[];
}
export const storeIrecDevicesToImport = (payload: IStoreIrecDevicesToImport['payload']) => ({
    type: DevicesActions.storeMyIrecDevices,
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
