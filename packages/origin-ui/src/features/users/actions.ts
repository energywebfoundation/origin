import { User } from '@energyweb/user-registry';

export enum UsersActions {
    addUser = 'ADD_USER',
    updateUser = 'UPDATE_USER',
    updateCurrentUserId = 'UPDATE_CURRENT_USER_ID',
    requestUser = 'REQUEST_USER'
}

export interface IAddUserAction {
    type: UsersActions.addUser;
    payload: User.Entity;
}

export const addUser = (payload: IAddUserAction['payload']) => ({
    type: UsersActions.addUser,
    payload
});

export type TAddUserAction = typeof addUser;

export interface IUpdateUserAction {
    type: UsersActions.updateUser;
    payload: User.Entity;
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

export type IUsersAction =
    | IAddUserAction
    | IUpdateUserAction
    | IUpdateCurrentUserIdAction
    | IRequestUserAction;
