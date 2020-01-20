import { ProducingDevice } from '@energyweb/device-registry';

export enum ProducingDevicesActions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED'
}

export interface IProducingDeviceCreatedOrUpdatedAction {
    type: ProducingDevicesActions.producingDeviceCreatedOrUpdated;
    producingDevice: ProducingDevice.Entity;
}

export const producingDeviceCreatedOrUpdated = (producingDevice: ProducingDevice.Entity) => ({
    type: ProducingDevicesActions.producingDeviceCreatedOrUpdated,
    producingDevice
});

export type TProducingDeviceCreatedOrUpdated = typeof producingDeviceCreatedOrUpdated;

export type IProducingDevicesAction = IProducingDeviceCreatedOrUpdatedAction;
