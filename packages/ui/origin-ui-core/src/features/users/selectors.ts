import { ICoreState } from '../../types';
import { IOrganizationInvitation } from '@energyweb/origin-backend-core';
import { IUsersState } from './reducer';

const getActiveBlockchainAccountAddress = (state: ICoreState) =>
    state.usersState.activeBlockchainAccountAddress;

const getUserOffchain = (state: ICoreState) => state.usersState.userOffchain;

const getOrganizations = (state: ICoreState) => state.usersState.organizations;

const getInvitations = (state: ICoreState): IOrganizationInvitation[] =>
    state.usersState.invitations.invitations;

const getShowPendingInvitations = (state: ICoreState): boolean =>
    state.usersState.invitations.showPendingInvitationsModal;

const getIRecAccount = (state: ICoreState) => state.usersState.iRecAccount;

const getUserState = (state: ICoreState): IUsersState => state.usersState;

const getExchangeDepositAddress = (state: ICoreState) => state.usersState.exchangeDepositAddress;

export const fromUsersSelectors = {
    getActiveBlockchainAccountAddress,
    getUserOffchain,
    getOrganizations,
    getInvitations,
    getShowPendingInvitations,
    getUserState,
    getIRecAccount,
    getExchangeDepositAddress
};
