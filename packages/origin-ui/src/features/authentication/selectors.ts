import { IStoreState } from '../../types';

export const isUsingInBrowserPK = (state: IStoreState): boolean =>
    state.authentication.activeAccount && Boolean(state.authentication.activeAccount.privateKey);

export const getActiveAccount = (state: IStoreState) => state.authentication.activeAccount;

export const getAccounts = (state: IStoreState) => state.authentication.accounts;

export const getEncryptedAccounts = (state: IStoreState) => state.authentication.encryptedAccounts;
