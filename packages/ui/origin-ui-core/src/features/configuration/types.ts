import { Configuration } from '@energyweb/device-registry';
import { ConfigurationActions } from './actions';

export interface IConfigurationUpdatedAction {
    type: ConfigurationActions.configurationUpdated;
    payload: Configuration.Entity;
}

export interface IConfigurationState {
    configuration: Configuration.Entity;
}
