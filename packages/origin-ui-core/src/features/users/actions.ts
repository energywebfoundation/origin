import { MarketUser } from '@energyweb/market';
import { IStoreState } from '../../types';
import { IUserWithRelations } from '@energyweb/origin-backend-core';

export enum UsersActions {
    addUser = 'ADD_USER',
    updateUser = 'UPDATE_USER',
    updateCurrentUserId = 'UPDATE_CURRENT_USER_ID',
    requestUser = 'REQUEST_USER',
    updateFetcher = 'UPDATE_USER_FETCHER',
    setUserOffchain = 'SET_USER_OFFCHAIN',
    setAuthenticationToken = 'SET_AUTHENTICATION_TOKEN',
    clearAuthenticationToken = 'CLEAR_AUTHENTICATION_TOKEN',
    refreshUserOffchain = 'REFRESH_USER_OFFCHAIN'
}

export interface IAddUserAction {
    type: UsersActions.addUser;
    payload: MarketUser.Entity;
}

export const addUser = (payload: IAddUserAction['payload']) => ({
    type: UsersActions.addUser,
    payload
});

export type TAddUserAction = typeof addUser;

export interface IUpdateUserAction {
    type: UsersActions.updateUser;
    payload: MarketUser.Entity;
}

export const updateUser = (payload: IUpdateUserAction['payload']) => ({
    type: UsersActions.updateUser,
    payload
});

export type TUpdateUserAction = typeof updateUser;

export interface IUpdateCurrentUserIdAction {
    type: UsersActions.updateCurrentUserId;
    payload: string;
}

export const updateCurrentUserId = (payload: IUpdateCurrentUserIdAction['payload']) => ({
    type: UsersActions.updateCurrentUserId,
    payload
});

export type TUpdateCurrentUserId = typeof updateCurrentUserId;

export interface IRequestUserAction {
    type: UsersActions.requestUser;
    payload: string;
}

export const requestUser = (payload: IRequestUserAction['payload']) => ({
    type: UsersActions.requestUser,
    payload
});

export type TRequestUserAction = typeof requestUser;

export interface IUserFetcher {
    fetch: (id: string, configuration: IStoreState['configuration']) => Promise<MarketUser.Entity>;
}

export interface IUpdateFetcherAction {
    type: UsersActions.updateFetcher;
    payload: IUserFetcher;
}

export const updateFetcher = (payload: IUpdateFetcherAction['payload']) => ({
    type: UsersActions.updateFetcher,
    payload
});

export type TUpdateFetcherAction = typeof updateFetcher;

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
    | IAddUserAction
    | IUpdateUserAction
    | IUpdateCurrentUserIdAction
    | IRequestUserAction
    | IUpdateFetcherAction
    | ISetUserOffchainAction
    | ISetAuthenticationTokenAction
    | IClearAuthenticationTokenAction
    | IRefreshUserOffchainAction;
