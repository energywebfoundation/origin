import { IStoreState } from '../../types';

export const getAccountChangedModalVisible = (state: IStoreState) =>
    state.general.accountChangedModalVisible;

export const getAccountChangedModalEnabled = (state: IStoreState) =>
    state.general.accountChangedModalEnabled;

export const getLoading = (state: IStoreState) => state.general.loading;

export const getError = (state: IStoreState) => state.general.error;

export const getRequestPasswordModalVisible = (state: IStoreState) =>
    state.general.requestPasswordModalVisible;

export const getRequestPasswordModalCallback = (state: IStoreState) =>
    state.general.requestPasswordModalCallback;

export const getRequestPasswordModalTitle = (state: IStoreState) =>
    state.general.requestPasswordModalTitle;
