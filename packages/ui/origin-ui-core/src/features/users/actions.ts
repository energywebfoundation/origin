import { IUser, IFullOrganization, IOrganizationInvitation } from '@energyweb/origin-backend-core';
import { IUsersState } from './reducer';

export enum UsersActions {
    setActiveBlockchainAccountAddress = '[USERS] SET_ACTIVE_BLOCKCHAIN_ACCOUNT_ADDRESS',
    updateFetcher = '[USERS] UPDATE_USER_FETCHER',
    setUserOffchain = '[USERS] SET_USER_OFFCHAIN',
    setAuthenticationToken = '[USERS] SET_AUTHENTICATION_TOKEN',
    clearAuthenticationToken = '[USERS] CLEAR_AUTHENTICATION_TOKEN',
    refreshUserOffchain = '[USERS] REFRESH_USER_OFFCHAIN',
    refreshClients = '[USERS] REFRESH_CLIENTS',
    addOrganizations = '[USERS] ADD_ORGANIZATIONS',
    setInvitations = '[USERS] SET_INVITATIONS',
    setUserState = '[USERS] SET_USER_STATE',
    setIRecAccount = '[USERS] SET_IREC_ACCOUNT',
    updateUserBlockchain = '[USERS] UPDATE_USER_BLOCKCHAIN',
    createExchangeDepositAddress = '[USERS] CREATE_EXCHANGE_DEPOSIT_ADDRESS'
}

export interface ISetActiveBlockchainAccountAddressAction {
    type: UsersActions.setActiveBlockchainAccountAddress;
    payload: string;
}

const setActiveBlockchainAccountAddress = (
    payload: ISetActiveBlockchainAccountAddressAction['payload']
) => ({
    type: UsersActions.setActiveBlockchainAccountAddress,
    payload
});

export type TSetActiveBlockchainAccountAddress = typeof setActiveBlockchainAccountAddress;

export interface ISetUserOffchainAction {
    type: UsersActions.setUserOffchain;
    payload: IUser;
}

const setUserOffchain = (payload: ISetUserOffchainAction['payload']) => ({
    type: UsersActions.setUserOffchain,
    payload
});

export type TSetUserOffchainAction = typeof setUserOffchain;

export interface IRefreshUserOffchainAction {
    type: UsersActions.refreshUserOffchain;
}

const refreshUserOffchain = () => ({
    type: UsersActions.refreshUserOffchain
});

export type TRefreshUserOffchainAction = typeof refreshUserOffchain;

export interface IRefreshClientsAction {
    type: UsersActions.refreshUserOffchain;
}

const refreshClients = () => ({
    type: UsersActions.refreshClients
});

export type TRefreshClientsAction = typeof refreshClients;

export interface ISetAuthenticationTokenAction {
    type: UsersActions.setAuthenticationToken;
    payload: string;
}

const setAuthenticationToken = (payload: ISetAuthenticationTokenAction['payload']) => ({
    type: UsersActions.setAuthenticationToken,
    payload
});

export type TSetAuthenticationTokenAction = typeof setAuthenticationToken;

export interface IClearAuthenticationTokenAction {
    type: UsersActions.clearAuthenticationToken;
}

const clearAuthenticationToken = () => ({
    type: UsersActions.clearAuthenticationToken
});

export type TClearAuthenticationTokenAction = typeof clearAuthenticationToken;

interface IAddOrganizationsAction {
    type: UsersActions.addOrganizations;
    payload: IFullOrganization[];
}

const addOrganizations = (payload: IAddOrganizationsAction['payload']) => ({
    type: UsersActions.addOrganizations,
    payload
});

interface ISetInvitationsAction {
    type: UsersActions.setInvitations;
    payload: IOrganizationInvitation[];
}

const setInvitations = (payload: ISetInvitationsAction['payload']): ISetInvitationsAction => ({
    type: UsersActions.setInvitations,
    payload
});

interface ISetIRecAccountAction {
    type: UsersActions.setIRecAccount;
    payload;
}

const setIRecAccount = (payload: ISetIRecAccountAction['payload']): ISetIRecAccountAction => ({
    type: UsersActions.setIRecAccount,
    payload
});

interface ISetUserState {
    type: UsersActions.setUserState;
    payload: IUsersState;
}
const setUserState = (payload: ISetUserState['payload']): ISetUserState => ({
    type: UsersActions.setUserState,
    payload
});

export interface IUpdateUserBlockchainAction {
    type: UsersActions.updateUserBlockchain;
    payload: {
        user: IUser;
        activeAccount: string;
    };
}

const updateUserBlockchain = (payload: {
    activeAccount: string;
    user: IUser;
}): IUpdateUserBlockchainAction => ({
    type: UsersActions.updateUserBlockchain,
    payload
});

export interface ICreateExchangeDepositAddressAction {
    type: UsersActions.createExchangeDepositAddress;
}

const createExchangeDepositAddress = (): ICreateExchangeDepositAddressAction => ({
    type: UsersActions.createExchangeDepositAddress
});

export type TAddOrganizationsAction = typeof addOrganizations;

export type IUsersAction =
    | ISetActiveBlockchainAccountAddressAction
    | ISetUserOffchainAction
    | ISetAuthenticationTokenAction
    | IClearAuthenticationTokenAction
    | IRefreshUserOffchainAction
    | IRefreshClientsAction
    | IAddOrganizationsAction
    | ISetInvitationsAction
    | ISetUserState
    | ISetIRecAccountAction
    | IUpdateUserBlockchainAction
    | ICreateExchangeDepositAddressAction;

export const fromUsersActions = {
    setActiveBlockchainAccountAddress,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    refreshUserOffchain,
    refreshClients,
    addOrganizations,
    setInvitations,
    setUserState,
    setIRecAccount,
    updateUserBlockchain,
    createExchangeDepositAddress
};
