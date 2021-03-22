import { CreateDeviceDTO, DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';
import { IOriginDevice } from '../../types';
import { DevicesActions } from './actions';

export interface IDeviceState {
    allDevices: IOriginDevice[];
    myDevices: IOriginDevice[];
}

export interface IDeviceActions {
    type: DevicesActions;
    payload?;
}

export interface ICreateDeviceAction {
    type: DevicesActions.CREATE_DEVICE;
    payload: CreateDeviceDTO;
}

export interface IStoreAllDevicesAction {
    type: DevicesActions.STORE_ALL_DEVICES;
    payload: IOriginDevice[];
}

export interface IStoreMyDevicesAction {
    type: DevicesActions.STORE_MY_DEVICES;
    payload: IOriginDevice[];
}

export interface IApproveDeviceAction {
    type: DevicesActions.APPROVE_DEVICE;
    payload: number;
}

export interface IAddReadsAllDevices {
    type: DevicesActions.ADD_READS_ALL_DEVICES;
    payload: DeviceDTO[];
}

export interface IAddReadsMyDevices {
    type: DevicesActions.ADD_READS_MY_DEVICES;
    payload: DeviceDTO[];
}
