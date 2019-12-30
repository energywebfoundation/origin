import { Demand } from '@energyweb/market';
import { IStoreState } from '../types';

export enum Actions {
    demandCreated = 'DEMAND_CREATED',
    demandUpdated = 'DEMAND_UPDATED',
    producingDeviceCreatedOrUpdated = 'PRODUCING_DEVICE_CREATED_OR_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED'
}

export const demandCreated = (demand: Demand.Entity) => ({
    type: Actions.demandCreated,
    demand
});

export const demandUpdated = (demand: Demand.Entity) => ({
    type: Actions.demandUpdated,
    demand
});

export interface IConfigurationUpdatedAction {
    type: Actions.configurationUpdated;
    conf: IStoreState['configuration'];
}

export const configurationUpdated = (conf: IConfigurationUpdatedAction['conf']) => ({
    type: Actions.configurationUpdated,
    conf
});

export type TConfigurationUpdatedAction = typeof configurationUpdated;
