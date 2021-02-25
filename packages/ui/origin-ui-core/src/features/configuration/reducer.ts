import { ConfigurationActions } from './actions';
import { IConfigurationState } from './types';

const defaultState: IConfigurationState = {
    configuration: null
};

export function configurationState(state = defaultState, { type, payload }) {
    switch (type) {
        case ConfigurationActions.configurationUpdated:
            return { configuration: payload };

        default:
            return state;
    }
}
