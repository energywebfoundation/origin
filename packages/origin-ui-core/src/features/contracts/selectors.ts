import { IStoreState } from '../../types';
import { IContractsLookup } from '@energyweb/origin-backend-core';

export const getContractsLookup = (state: IStoreState): IContractsLookup =>
    state.contracts.contractsLookup;
