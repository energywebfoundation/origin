import { ICoreState } from '../../types';
import { IOrganizationInvitation } from '@energyweb/origin-backend-core';
import { IUsersState } from './reducer';

export const getActiveBlockchainAccountAddress = (state: ICoreState) =>
    state.usersState.activeBlockchainAccountAddress;

export const getUserOffchain = (state: ICoreState) => state.usersState.userOffchain;

export const getOrganizations = (state: ICoreState) => state.usersState.organizations;

export const getInvitations = (state: ICoreState): IOrganizationInvitation[] =>
    state.usersState.invitations.invitations;

export const getShowPendingInvitations = (state: ICoreState): boolean =>
    state.usersState.invitations.showPendingInvitationsModal;

export const getIRecAccount = (state: ICoreState) => state.usersState.iRecAccount;

export const getUserState = (state: ICoreState): IUsersState => state.usersState;

export const getExchangeDepositAddress = (state: ICoreState) =>
    state.usersState.exchangeDepositAddress;
