import { IStoreState } from '../types';

export enum Actions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED'
}

export interface IConfigurationUpdatedAction {
    type: Actions.configurationUpdated;
    conf: IStoreState['configuration'];
}

export const configurationUpdated = (conf: IConfigurationUpdatedAction['conf']) => ({
    type: Actions.configurationUpdated,
    conf
});

export type TConfigurationUpdatedAction = typeof configurationUpdated;
