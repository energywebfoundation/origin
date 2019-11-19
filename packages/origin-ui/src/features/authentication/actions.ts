import { EncryptedKeystoreV3Json } from 'web3-core';

export enum AuthenticationActions {
    addAccount = 'ADD_ACCOUNT',
    setActiveAccount = 'SET_ACTIVE_ACCOUNT',
    unlockAccount = 'UNLOCK_ACCOUNT',
    importAccount = 'IMPORT_ACCOUNT',
    addEncryptedAccount = 'ADD_ENCRYPTED_ACCOUNT',
    clearEncryptedAccounts = 'CLEAR_ENCRYPTED_ACCOUNTS'
}

export interface IAccount {
    address: string;
    privateKey?: string;
}

export interface IEncryptedAccount {
    address: string;
    encryptedPrivateKey: EncryptedKeystoreV3Json;
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

export interface IImportAccountAction {
    type: AuthenticationActions.importAccount;
    payload: {
        privateKey: string;
        password: string;
    };
}

export const importAccount = (payload: IImportAccountAction['payload']) => ({
    type: AuthenticationActions.importAccount,
    payload
});

export type TImportAccountAction = typeof importAccount;

export interface IAddEncryptedAccountAction {
    type: AuthenticationActions.addEncryptedAccount;
    payload: IEncryptedAccount;
}

export const addEncryptedAccount = (payload: IAddEncryptedAccountAction['payload']) => ({
    type: AuthenticationActions.addEncryptedAccount,
    payload
});

export type TAddEncryptedAccountAction = typeof addEncryptedAccount;

export interface IUnlockAccountAction {
    type: AuthenticationActions.unlockAccount;
    payload: {
        address: string;
        password: string;
    };
}

export const unlockAccount = (payload: IUnlockAccountAction['payload']) => ({
    type: AuthenticationActions.unlockAccount,
    payload
});

export type TUnlockAccountAction = typeof unlockAccount;

export interface IClearEncryptedAccountsAction {
    type: AuthenticationActions.clearEncryptedAccounts;
}

export const clearEncryptedAccounts = () => ({
    type: AuthenticationActions.clearEncryptedAccounts
});

export type TClearEncryptedAccounts = typeof clearEncryptedAccounts;

export type IAuthenticationAction =
    | IAddAccountAction
    | ISetActiveAccountAction
    | IImportAccountAction
    | IAddEncryptedAccountAction
    | IUnlockAccountAction
    | IClearEncryptedAccountsAction;
