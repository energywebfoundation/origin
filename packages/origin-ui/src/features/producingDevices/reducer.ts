import { ProducingDevicesActions, IProducingDevicesAction } from './actions';
import { ProducingDevice } from '@energyweb/asset-registry';

export interface IProducingDevicesState {
    producingDevices: ProducingDevice.Entity[];
}

const defaultState: IProducingDevicesState = {
    producingDevices: []
};

export default function reducer(
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
