import { IConfigurationUpdatedAction } from './types';

export enum ConfigurationActions {
    configurationUpdated = 'CONFIGURATION_UPDATED'
}

export const configurationUpdated = (
    payload: IConfigurationUpdatedAction['payload']
): IConfigurationUpdatedAction => ({
    type: ConfigurationActions.configurationUpdated,
    payload
});
