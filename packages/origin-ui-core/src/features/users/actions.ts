import {
    IUser,
    IOrganizationWithRelationsIds,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { IUsersState } from './reducer';

export enum UsersActions {
    setActiveBlockchainAccountAddress = 'USERS_SET_ACTIVE_BLOCKCHAIN_ACCOUNT_ADDRESS',
    updateFetcher = 'UPDATE_USER_FETCHER',
    setUserOffchain = 'SET_USER_OFFCHAIN',
    setAuthenticationToken = 'SET_AUTHENTICATION_TOKEN',
    clearAuthenticationToken = 'CLEAR_AUTHENTICATION_TOKEN',
    refreshUserOffchain = 'REFRESH_USER_OFFCHAIN',
    addOrganizations = 'USERS_ADD_ORGANIZATIONS',
    setInvitations = 'USERS_SET_INVITATIONS',
    setUserState = 'USERS_SET_USER_STATE'
}

export interface ISetActiveBlockchainAccountAddressAction {
    type: UsersActions.setActiveBlockchainAccountAddress;
    payload: string;
}

export const setActiveBlockchainAccountAddress = (
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

export const setUserOffchain = (payload: ISetUserOffchainAction['payload']) => ({
    type: UsersActions.setUserOffchain,
    payload
});

export type TSetUserOffchainAction = typeof setUserOffchain;

export interface IRefreshUserOffchainAction {
    type: UsersActions.refreshUserOffchain;
}

export const refreshUserOffchain = () => ({
    type: UsersActions.refreshUserOffchain
});

export type TRefreshUserOffchainAction = typeof refreshUserOffchain;

export interface ISetAuthenticationTokenAction {
    type: UsersActions.setAuthenticationToken;
    payload: string;
}

export const setAuthenticationToken = (payload: ISetAuthenticationTokenAction['payload']) => ({
    type: UsersActions.setAuthenticationToken,
    payload
});

export type TSetAuthenticationTokenAction = typeof setAuthenticationToken;

export interface IClearAuthenticationTokenAction {
    type: UsersActions.clearAuthenticationToken;
}

export const clearAuthenticationToken = () => ({
    type: UsersActions.clearAuthenticationToken
});

export type TClearAuthenticationTokenAction = typeof clearAuthenticationToken;

export interface IAddOrganizationsAction {
    type: UsersActions.addOrganizations;
    payload: IOrganizationWithRelationsIds[];
}

export const addOrganizations = (payload: IAddOrganizationsAction['payload']) => ({
    type: UsersActions.addOrganizations,
    payload
});

export interface ISetInvitationsAction {
    type: UsersActions.setInvitations;
    payload: IOrganizationInvitation[];
}

export const setInvitations = (
    payload: ISetInvitationsAction['payload']
): ISetInvitationsAction => ({
    type: UsersActions.setInvitations,
    payload
});

export interface ISetUserState {
    type: UsersActions.setUserState;
    payload: IUsersState;
}

export const setUserState = (payload: ISetUserState['payload']): ISetUserState => ({
    type: UsersActions.setUserState,
    payload
});

export type TAddOrganizationsAction = typeof addOrganizations;

export type IUsersAction =
    | ISetActiveBlockchainAccountAddressAction
    | ISetUserOffchainAction
    | ISetAuthenticationTokenAction
    | IClearAuthenticationTokenAction
    | IRefreshUserOffchainAction
    | IAddOrganizationsAction
    | ISetInvitationsAction
    | ISetUserState;
