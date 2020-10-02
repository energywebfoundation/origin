import { IStoreState } from '../../types';
import { ExternalDeviceIdType } from '@energyweb/origin-backend-core';

export const getLoading = (state: IStoreState) => state.general.loading;

export const getError = (state: IStoreState) => state.general.error;

export const getOffChainDataSource = (state: IStoreState) => state.general.offChainDataSource;

export const getEnvironment = (state: IStoreState) => state.general.environment;

export const getCurrencies = (state: IStoreState): string[] =>
    state.general.offChainConfiguration?.currencies || ['USD'];

export const getCompliance = (state: IStoreState): string =>
    state.general.offChainConfiguration?.complianceStandard;

export const getRegions = (state: IStoreState): any => state.general.offChainConfiguration?.regions;

export const getCountry = (state: IStoreState): string =>
    state.general.offChainConfiguration?.countryName;

export const getExchangeClient = (state: IStoreState) => state.general.exchangeClient;

export const getExternalDeviceIdTypes = (state: IStoreState): ExternalDeviceIdType[] =>
    state.general.offChainConfiguration?.externalDeviceIdTypes;

export const getOffchainConfiguration = (state: IStoreState) => state.general.offChainConfiguration;

export const getAccountMismatchModalProperties = (state: IStoreState) =>
    state.general.accountMismatchModalProperties;

export const getNoAccountModalVisibility = (state: IStoreState) =>
    state.general.noAccountModalVisibility;

export const getIRecClient = (state: IStoreState) => state.general.iRecClient;
