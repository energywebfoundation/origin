import { ProducingDevicesActions, IProducingDevicesAction } from './actions';
import { ProducingDevice } from '@energyweb/device-registry';
import { IPublicOrganization } from '@energyweb/origin-backend-core';

export interface IProducingDeviceState extends ProducingDevice.Entity {
    organization: IPublicOrganization;
}

export interface IProducingDevicesState {
    producingDevices: IProducingDeviceState[];
}

const defaultState: IProducingDevicesState = {
    producingDevices: []
};

export function producingDevicesState(
    state = defaultState,
    action: IProducingDevicesAction
): IProducingDevicesState {
    switch (action.type) {
        case ProducingDevicesActions.producingDeviceCreatedOrUpdated:
            const index: number = state.producingDevices.findIndex(
                (c: ProducingDevice.Entity) => c.id === action.producingDevice.id
            );

            return {
                producingDevices:
                    index === -1
                        ? [...state.producingDevices, action.producingDevice]
                        : [
                              ...state.producingDevices.slice(0, index),
                              action.producingDevice,
                              ...state.producingDevices.slice(index + 1)
                          ]
            };

        default:
            return state;
    }
}
