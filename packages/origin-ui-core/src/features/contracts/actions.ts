import { IContractsLookup } from '@energyweb/origin-backend-core';

export enum ContractsActions {
    setContractsLookup = 'CONTRACTS_SET_LOOKUP'
}

export interface ISetContractsLookupAction {
    type: ContractsActions.setContractsLookup;
    payload: IContractsLookup;
}

export const setContractsLookup = (payload: ISetContractsLookupAction['payload']) => ({
    type: ContractsActions.setContractsLookup,
    payload
});

export type TSetContractsLookup = typeof setContractsLookup;

export type IContractsAction = ISetContractsLookupAction;
