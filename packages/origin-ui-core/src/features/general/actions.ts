import { IExchangeClient } from '../../utils/exchange';
import {
    IOriginConfiguration,
    DeviceCreateData,
    IOffChainDataSource
} from '@energyweb/origin-backend-core';

export enum GeneralActions {
    setLoading = 'GENERAL_SET_LOADING',
    setError = 'GENERAL_SET_ERROR',
    setOffChainDataSource = 'GENERAL_SET_OFF_CHAIN_DATA_SOURCE',
    setExchangeClient = 'GENERAL_SET_EXCHANGE_CLIENT',
    setEnvironment = 'GENERAL_SET_ENVIRONMENT',
    setOffchainConfiguration = 'GENERAL_SET_OFFCHAIN_CONFIGURATION',
    setAccountMismatchModalProperties = 'GENERAL_SET_ACCOUNT_MISMATCH_MODAL_PROPERTIES',
    accountMismatchModalResolved = 'GENERAL_ACCOUNT_MISMATCH_MODAL_RESOLVED',
    requestDeviceCreation = 'GENERAL_REQUEST_DEVICE_CREATION',
    setNoAccountModalVisibility = 'NO_ACCOUNT_MODAL_VISIBILITY'
}

export interface IEnvironment {
    MODE: string;
    BACKEND_URL: string;
    BACKEND_PORT: string;
    BLOCKCHAIN_EXPLORER_URL: string;
    WEB3: string;
    REGISTRATION_MESSAGE_TO_SIGN: string;
    ISSUER_ID: string;
    DEVICE_PROPERTIES_ENABLED: string;
    DEFAULT_ENERGY_IN_BASE_UNIT: string;
    EXCHANGE_WALLET_PUB: string;
    GOOGLE_MAPS_API_KEY: string;
}

export interface ISetLoadingAction {
    type: GeneralActions.setLoading;
    payload: boolean;
}

export const setLoading = (payload: ISetLoadingAction['payload']) => ({
    type: GeneralActions.setLoading,
    payload
});

export type TSetLoading = typeof setLoading;

export interface ISetErrorAction {
    type: GeneralActions.setError;
    payload: string;
}

export const setError = (payload: ISetErrorAction['payload']) => ({
    type: GeneralActions.setError,
    payload
});

export type TSetError = typeof setError;

export interface ISetOffChainDataSourceAction {
    type: GeneralActions.setOffChainDataSource;
    payload: IOffChainDataSource;
}

export const setOffChainDataSource = (payload: ISetOffChainDataSourceAction['payload']) => ({
    type: GeneralActions.setOffChainDataSource,
    payload
});

export type TSetOffChainDataSourceAction = typeof setOffChainDataSource;

export interface ISetEnvironmentAction {
    type: GeneralActions.setEnvironment;
    payload: IEnvironment;
}

export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: GeneralActions.setEnvironment,
    payload
});

export type TSetEnvironmentAction = typeof setEnvironment;

export interface ISetExchangeClientAction {
    type: GeneralActions.setExchangeClient;
    payload: {
        exchangeClient: IExchangeClient;
    };
}

export const setExchangeClient = (payload: ISetExchangeClientAction['payload']) => ({
    type: GeneralActions.setExchangeClient,
    payload
});

export type TSetExchangeClientAction = typeof setExchangeClient;

export interface ISetOffchainConfigurationAction {
    type: GeneralActions.setOffchainConfiguration;
    payload: {
        configuration: IOriginConfiguration;
    };
}

export const setOffchainConfiguration = (payload: ISetOffchainConfigurationAction['payload']) => ({
    type: GeneralActions.setOffchainConfiguration,
    payload
});

export type TSetOffchainConfigurationAction = typeof setOffchainConfiguration;

export interface IAccountMismatchModalResolvedAction {
    type: GeneralActions.accountMismatchModalResolved;
    payload: boolean;
}

export const accountMismatchModalResolvedAction = (
    payload: IAccountMismatchModalResolvedAction['payload']
) => ({
    type: GeneralActions.accountMismatchModalResolved,
    payload
});

export type TAccountMismatchModalResolvedAction = typeof accountMismatchModalResolvedAction;

export interface ISetAccountMismatchModalPropertiesAction {
    type: GeneralActions.setAccountMismatchModalProperties;
    payload: {
        visibility: boolean;
    };
}

export const setAccountMismatchModalPropertiesAction = (
    payload: ISetAccountMismatchModalPropertiesAction['payload']
) => ({
    type: GeneralActions.setAccountMismatchModalProperties,
    payload
});

export type TSetAccountMismatchModalPropertiesAction = typeof setAccountMismatchModalPropertiesAction;

export interface ISetNoAccountModalVisibilityAction {
    type: GeneralActions.setNoAccountModalVisibility;
    payload: boolean;
}

export const setNoAccountModalVisibilityAction = (
    payload: ISetNoAccountModalVisibilityAction['payload']
) => ({
    type: GeneralActions.setNoAccountModalVisibility,
    payload
});

export type TSetNoAccountModalVisibilityAction = typeof setNoAccountModalVisibilityAction;

export interface IRequestDeviceCreationAction {
    type: GeneralActions.requestDeviceCreation;
    payload: {
        data: DeviceCreateData;
        callback: () => void;
    };
}

export const requestDeviceCreation = (payload: IRequestDeviceCreationAction['payload']) => ({
    type: GeneralActions.requestDeviceCreation,
    payload
});

export type TRequestDeviceCreationAction = typeof requestDeviceCreation;

export type IGeneralAction =
    | ISetLoadingAction
    | ISetErrorAction
    | ISetOffChainDataSourceAction
    | ISetEnvironmentAction
    | ISetExchangeClientAction
    | ISetOffchainConfigurationAction
    | ISetAccountMismatchModalPropertiesAction
    | ISetNoAccountModalVisibilityAction
    | IAccountMismatchModalResolvedAction
    | IRequestDeviceCreationAction;
