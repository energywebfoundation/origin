import { ICoreState } from '../../types';
import { ExternalDeviceIdType } from '@energyweb/origin-backend-core';

export const getLoading = (state: ICoreState) => state.generalState.loading;

export const getError = (state: ICoreState) => state.generalState.error;

export const getOffChainDataSource = (state: ICoreState) => state.generalState.offChainDataSource;

export const getEnvironment = (state: ICoreState) => state.generalState.environment;

export const getCurrencies = (state: ICoreState): string[] =>
    state.generalState.offChainConfiguration?.currencies || ['USD'];

export const getCompliance = (state: ICoreState): string =>
    state.generalState.offChainConfiguration?.complianceStandard;

export const getRegions = (state: ICoreState): any =>
    state.generalState.offChainConfiguration?.regions;

export const getCountry = (state: ICoreState): string =>
    state.generalState.offChainConfiguration?.countryName;

export const getExchangeClient = (state: ICoreState) => state.generalState.exchangeClient;

export const getExternalDeviceIdTypes = (state: ICoreState): ExternalDeviceIdType[] =>
    state.generalState.offChainConfiguration?.externalDeviceIdTypes;

export const getOffchainConfiguration = (state: ICoreState) =>
    state.generalState.offChainConfiguration;

export const getAccountMismatchModalProperties = (state: ICoreState) =>
    state.generalState.accountMismatchModalProperties;

export const getNoAccountModalVisibility = (state: ICoreState) =>
    state.generalState.noAccountModalVisibility;

export const getIRecClient = (state: ICoreState) => state.generalState.iRecClient;
