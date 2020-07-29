import { IProducingDeviceState } from './reducer';

export enum ProducingDevicesActions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED'
}

export interface IProducingDeviceCreatedOrUpdatedAction {
    type: ProducingDevicesActions.producingDeviceCreatedOrUpdated;
    producingDevice: IProducingDeviceState;
}

export const producingDeviceCreatedOrUpdated = (producingDevice: IProducingDeviceState) => ({
    type: ProducingDevicesActions.producingDeviceCreatedOrUpdated,
    producingDevice
});

export type TProducingDeviceCreatedOrUpdated = typeof producingDeviceCreatedOrUpdated;

export type IProducingDevicesAction = IProducingDeviceCreatedOrUpdatedAction;
