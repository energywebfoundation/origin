import { ICoreState } from '../types';

export enum BaseActions {
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED',
    web3Updated = 'WEB3_UPDATED'
}

export interface IConfigurationUpdatedAction {
    type: BaseActions.configurationUpdated;
    conf: ICoreState['configurationState'];
}

export interface IWeb3UpdatedAction {
    type: Actions.web3Updated;
    web3: IStoreState['web3'];
}

export const configurationUpdated = (conf: IConfigurationUpdatedAction['conf']) => ({
    type: BaseActions.configurationUpdated,
    conf
});

export const web3Updated = (web3: IWeb3UpdatedAction['web3']) => ({
    type: Actions.web3Updated,
    web3
});

export type TConfigurationUpdatedAction = typeof configurationUpdated;
export type TWeb3UpdatedAction = typeof web3Updated;
