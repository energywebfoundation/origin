import { IStoreState } from '../../types';

export const getActiveAccount = (state: IStoreState) => state.authentication.activeAccount;

export const getAccounts = (state: IStoreState) => state.authentication.accounts;
