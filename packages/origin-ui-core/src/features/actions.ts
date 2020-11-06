import { IStoreState } from '../types';

export enum Actions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED',
    web3Updated = 'WEB3_UPDATED'
}

export interface IConfigurationUpdatedAction {
    type: Actions.configurationUpdated;
    conf: IStoreState['configuration'];
}

export interface IWeb3UpdatedAction {
    type: Actions.web3Updated;
    web3: IStoreState['web3'];
}

export const configurationUpdated = (conf: IConfigurationUpdatedAction['conf']) => ({
    type: Actions.configurationUpdated,
    conf
});

export const web3Updated = (web3: IWeb3UpdatedAction['web3']) => ({
    type: Actions.web3Updated,
    web3
});

export type TConfigurationUpdatedAction = typeof configurationUpdated;
export type TWeb3UpdatedAction = typeof web3Updated;
