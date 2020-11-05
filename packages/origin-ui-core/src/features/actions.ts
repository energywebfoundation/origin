import { ICoreState } from '../types';

export enum BaseActions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED'
}

export interface IConfigurationUpdatedAction {
    type: BaseActions.configurationUpdated;
    conf: ICoreState['configurationState'];
}

export const configurationUpdated = (conf: IConfigurationUpdatedAction['conf']) => ({
    type: BaseActions.configurationUpdated,
    conf
});

export type TConfigurationUpdatedAction = typeof configurationUpdated;
