import { IStoreState } from '../../types';
import { IOrganizationInvitation } from '@energyweb/origin-backend-core';

export const getActiveBlockchainAccountAddress = (state: IStoreState) =>
    state.users.activeBlockchainAccountAddress;

export const getUserOffchain = (state: IStoreState) => state.users.userOffchain;

export const getOrganizations = (state: IStoreState) => state.users.organizations;

export const getInvitations = (state: IStoreState): IOrganizationInvitation[] =>
    state.users.invitations.invitations;

export const getShowPendingInvitations = (state: IStoreState): boolean =>
    state.users.invitations.showPendingInvitationsModal;
