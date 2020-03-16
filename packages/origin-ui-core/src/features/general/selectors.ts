import { IStoreState } from '../../types';
import { ExternalDeviceIdType } from '@energyweb/origin-backend-core';

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

export const getOffChainDataSource = (state: IStoreState) => state.general.offChainDataSource;

export const getEnvironment = (state: IStoreState) => state.general.environment;

export const getCurrencies = (state: IStoreState): string[] => state.general.currencies;

export const getCompliance = (state: IStoreState): string => state.general.compliance;

export const getRegions = (state: IStoreState): object => state.general.regions;

export const getCountry = (state: IStoreState): string => state.general.country;

export const getExchangeClient = (state: IStoreState) => state.general.exchangeClient;

export const getExternalDeviceIdTypes = (state: IStoreState): ExternalDeviceIdType[] =>
    state.general.externalDeviceIdTypes;
