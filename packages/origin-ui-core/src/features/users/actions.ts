import { IUserWithRelations } from '@energyweb/origin-backend-core';

export enum UsersActions {
    setActiveBlockchainAccountAddress = 'USERS_SET_ACTIVE_BLOCKCHAIN_ACCOUNT_ADDRESS',
    updateFetcher = 'UPDATE_USER_FETCHER',
    setUserOffchain = 'SET_USER_OFFCHAIN',
    setAuthenticationToken = 'SET_AUTHENTICATION_TOKEN',
    clearAuthenticationToken = 'CLEAR_AUTHENTICATION_TOKEN',
    refreshUserOffchain = 'REFRESH_USER_OFFCHAIN'
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
    payload: IUserWithRelations;
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

export type IUsersAction =
    | ISetActiveBlockchainAccountAddressAction
    | ISetUserOffchainAction
    | ISetAuthenticationTokenAction
    | IClearAuthenticationTokenAction
    | IRefreshUserOffchainAction;
