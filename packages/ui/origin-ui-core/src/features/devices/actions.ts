import {
    ICreateDeviceAction,
    IStoreAllDevicesAction,
    IStoreMyDevicesAction,
    IDeviceActions,
    IApproveDeviceAction,
    IAddReadsAllDevices,
    IAddReadsMyDevices
} from './types';

export enum DevicesActions {
    FETCH_ALL_DEVICES = 'FETCH_ALL_DEVICES',
    FETCH_MY_DEVICES = 'FETCH_MY_DEVICES',
    CLEAR_ALL_DEVICES = 'CLEAR_ALL_DEVICES',
    CLEAR_MY_DEVICES = 'CLEAR_MY_DEVICES',
    CREATE_DEVICE = 'CREATE_DEVICE',
    STORE_ALL_DEVICES = 'STORE_ALL_DEVICES',
    STORE_MY_DEVICES = 'STORE_MY_DEVICES',
    APPROVE_DEVICE = 'APPROVE_DEVICE',
    ADD_READS_ALL_DEVICES = 'ADD_READS_ALL_DEVICES',
    ADD_READS_MY_DEVICES = 'ADD_READS_MY_DEVICES'
}

export const fetchAllDevices = (): IDeviceActions => ({
    type: DevicesActions.FETCH_ALL_DEVICES
});

export const fetchMyDevices = (): IDeviceActions => ({
    type: DevicesActions.FETCH_MY_DEVICES
});

export const clearAllDevices = (): IDeviceActions => ({
    type: DevicesActions.CLEAR_ALL_DEVICES
});

export const clearMyDevices = (): IDeviceActions => ({
    type: DevicesActions.CLEAR_MY_DEVICES
});

export const storeAllDevices = (
    payload: IStoreAllDevicesAction['payload']
): IStoreAllDevicesAction => ({
    type: DevicesActions.STORE_ALL_DEVICES,
    payload
});

export const storeMyDevices = (
    payload: IStoreMyDevicesAction['payload']
): IStoreMyDevicesAction => ({
    type: DevicesActions.STORE_MY_DEVICES,
    payload
});

export const createDevice = (payload: ICreateDeviceAction['payload']): ICreateDeviceAction => ({
    type: DevicesActions.CREATE_DEVICE,
    payload
});

export const approveDevice = (payload: IApproveDeviceAction['payload']): IApproveDeviceAction => ({
    type: DevicesActions.APPROVE_DEVICE,
    payload
});

export const addReadsAllDevices = (
    payload: IAddReadsAllDevices['payload']
): IAddReadsAllDevices => ({
    type: DevicesActions.ADD_READS_ALL_DEVICES,
    payload
});

export const addReadsMyDevices = (payload: IAddReadsMyDevices['payload']): IAddReadsMyDevices => ({
    type: DevicesActions.ADD_READS_MY_DEVICES,
    payload
});
