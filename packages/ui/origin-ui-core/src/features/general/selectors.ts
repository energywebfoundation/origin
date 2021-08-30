import { ICoreState } from '../../types';
import { ExternalDeviceIdType } from '@energyweb/origin-backend-core';
import { IEnvironment } from './actions';

const getLoading = (state: ICoreState) => state.generalState.loading;

const getError = (state: ICoreState) => state.generalState.error;

const getBackendClient = (state: ICoreState) => state.generalState.backendClient;

const getEnvironment = (state: ICoreState): IEnvironment => state.generalState.environment;

const getCurrencies = (state: ICoreState): string[] =>
    state.generalState.offChainConfiguration?.currencies || ['USD'];

const getCompliance = (state: ICoreState): string =>
    state.generalState.offChainConfiguration?.complianceStandard;

const getRegions = (state: ICoreState): any => state.generalState.offChainConfiguration?.regions;

const getCountry = (state: ICoreState): string =>
    state.generalState.offChainConfiguration?.countryName;

const getExchangeClient = (state: ICoreState) => state.generalState.exchangeClient;

const getExternalDeviceIdTypes = (state: ICoreState): ExternalDeviceIdType[] =>
    state.generalState.offChainConfiguration?.externalDeviceIdTypes;

const getOffchainConfiguration = (state: ICoreState) => state.generalState.offChainConfiguration;

const getAccountMismatchModalProperties = (state: ICoreState) =>
    state.generalState.accountMismatchModalProperties;

const getNoAccountModalVisibility = (state: ICoreState) =>
    state.generalState.noAccountModalVisibility;

const getIRecClient = (state: ICoreState) => state.generalState.iRecClient;

const getDeviceClient = (store: ICoreState) => store.generalState.backendClient.deviceClient;

export const fromGeneralSelectors = {
    getLoading,
    getError,
    getBackendClient,
    getCurrencies,
    getEnvironment,
    getCompliance,
    getRegions,
    getCountry,
    getExchangeClient,
    getExternalDeviceIdTypes,
    getIRecClient,
    getNoAccountModalVisibility,
    getOffchainConfiguration,
    getAccountMismatchModalProperties,
    getDeviceClient
};
