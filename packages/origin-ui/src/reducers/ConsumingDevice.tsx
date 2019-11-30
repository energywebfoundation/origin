import { Actions } from '../features/actions';
import { ConsumingDevice } from '@energyweb/asset-registry';

const defaultState = [];

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case Actions.consumingDeviceCreatedOrUpdated:
            const index: number = state.findIndex(
                (c: ConsumingDevice.Entity) => c.id === action.consumingDevice.id
            );

            return index === -1
                ? [...state, action.consumingDevice]
                : [...state.slice(0, index), action.consumingDevice, ...state.slice(index + 1)];

        default:
            return state;
    }
}
