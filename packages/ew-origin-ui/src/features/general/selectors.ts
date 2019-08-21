import { IStoreState } from '../../types';

export const getAccountChangedModalVisible = (state: IStoreState) =>
    state.general.accountChangedModalVisible;
export const getAccountChangedModalEnabled = (state: IStoreState) =>
    state.general.accountChangedModalEnabled;
