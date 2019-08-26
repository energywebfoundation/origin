import { IStoreState } from '../../types';

export const getAccountChangedModalVisible = (state: IStoreState) =>
    state.general.accountChangedModalVisible;

export const getAccountChangedModalEnabled = (state: IStoreState) =>
    state.general.accountChangedModalEnabled;

export const getLoading = (state: IStoreState) =>
    state.general.loading;

export const getError = (state: IStoreState) =>
    state.general.error;
