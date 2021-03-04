import { IEnvironment } from '@energyweb/origin-ui-core';
import { DeviceClient } from '../../utils/client';

export enum DeviceGeneralActions {
    SET_ENVIRONMENT = 'IREC_APP_SET_ENVIRONMENT',
    INITIALIZE_DEVICE_APP = 'IREC_APP_INITIALIZE_DEVICE_APP',
    SET_DEVICE_CLIENT = 'IREC_APP_SET_DEVICE_CLIENT'
}
export interface IDeviceGeneralAction {
    type: DeviceGeneralActions;
    payload?;
}

export interface ISetEnvironmentAction {
    type: DeviceGeneralActions.SET_ENVIRONMENT;
    payload: IEnvironment;
}
export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: DeviceGeneralActions.SET_ENVIRONMENT,
    payload
});
export type TSetEnvironmentAction = typeof setEnvironment;

export const initializeDeviceApp = (): IDeviceGeneralAction => ({
    type: DeviceGeneralActions.INITIALIZE_DEVICE_APP
});

export interface ISetDeviceClient extends IDeviceGeneralAction {
    payload: {
        deviceClient: DeviceClient;
    };
}
export const setDeviceClient = (payload: ISetDeviceClient['payload']) => ({
    type: DeviceGeneralActions.SET_DEVICE_CLIENT,
    payload
});
