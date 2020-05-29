import { IStoreState } from '../../types';

export const getActiveBlockchainAccountAddress = (state: IStoreState) =>
    state.users.activeBlockchainAccountAddress;

export const getUserOffchain = (state: IStoreState) => state.users.userOffchain;

export const getOrganizations = (state: IStoreState) => state.users.organizations;
