export enum AuthenticationActions {
    addAccount = 'ADD_ACCOUNT',
    setActiveAccount = 'SET_ACTIVE_ACCOUNT'
}

export interface IAccount {
    address: string;
    privateKey?: string;
}

export interface IAddAccountAction {
    type: AuthenticationActions.addAccount;
    payload: IAccount;
}

export const addAccount = (payload: IAddAccountAction['payload']) => ({
    type: AuthenticationActions.addAccount,
    payload
});

export type TAddAccountAction = typeof addAccount;

export interface ISetActiveAccountAction {
    type: AuthenticationActions.setActiveAccount;
    payload: IAccount;
}

export const setActiveAccount = (payload: ISetActiveAccountAction['payload']) => ({
    type: AuthenticationActions.setActiveAccount,
    payload
});

export type TSetActiveAccountAction = typeof setActiveAccount;

export type IAuthenticationAction = IAddAccountAction | ISetActiveAccountAction;
