import { IOriginConfiguration, DeviceCreateData } from '@energyweb/origin-backend-core';
import { ExchangeClient, BackendClient, IRecClient } from '../../utils';

export enum GeneralActions {
    setLoading = '[GENERAL] SET_LOADING',
    setError = '[GENERAL] SET_ERROR',
    setBackendClient = '[GENERAL] SET_BACKEND_CLIENT',
    setExchangeClient = '[GENERAL] SET_EXCHANGE_CLIENT',
    setEnvironment = '[GENERAL] SET_ENVIRONMENT',
    setOffchainConfiguration = '[GENERAL] SET_OFFCHAIN_CONFIGURATION',
    setAccountMismatchModalProperties = '[GENERAL] SET_ACCOUNT_MISMATCH_MODAL_PROPERTIES',
    accountMismatchModalResolved = '[GENERAL] ACCOUNT_MISMATCH_MODAL_RESOLVED',
    requestDeviceCreation = '[GENERAL] REQUEST_DEVICE_CREATION',
    setNoAccountModalVisibility = '[GENERAL] NO_ACCOUNT_MODAL_VISIBILITY',
    setIRecClient = '[GENERAL] SET_IREC_CLIENT'
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
    MARKET_UTC_OFFSET: number;
    DISABLED_UI_FEATURES: string;
    SMART_METER_ID: string;
}

export interface ISetLoadingAction {
    type: GeneralActions.setLoading;
    payload: boolean;
}

const setLoading = (payload: ISetLoadingAction['payload']) => ({
    type: GeneralActions.setLoading,
    payload
});

export type TSetLoading = typeof setLoading;

export interface ISetErrorAction {
    type: GeneralActions.setError;
    payload: string;
}

const setError = (payload: ISetErrorAction['payload']) => ({
    type: GeneralActions.setError,
    payload
});

export type TSetError = typeof setError;

export interface ISetBackendClientAction {
    type: GeneralActions.setBackendClient;
    payload: BackendClient;
}

export type TSetBackendClientAction = typeof setBackendClient;
const setBackendClient = (payload: ISetBackendClientAction['payload']) => ({
    type: GeneralActions.setBackendClient,
    payload
});

export interface ISetEnvironmentAction {
    type: GeneralActions.setEnvironment;
    payload: IEnvironment;
}
const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: GeneralActions.setEnvironment,
    payload
});

export type TSetEnvironmentAction = typeof setEnvironment;
export interface ISetExchangeClientAction {
    type: GeneralActions.setExchangeClient;
    payload: ExchangeClient;
}
const setExchangeClient = (payload: ISetExchangeClientAction['payload']) => ({
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
const setOffchainConfiguration = (payload: ISetOffchainConfigurationAction['payload']) => ({
    type: GeneralActions.setOffchainConfiguration,
    payload
});

export type TSetOffchainConfigurationAction = typeof setOffchainConfiguration;
export interface IAccountMismatchModalResolvedAction {
    type: GeneralActions.accountMismatchModalResolved;
    payload: boolean;
}
const accountMismatchModalResolved = (payload: IAccountMismatchModalResolvedAction['payload']) => ({
    type: GeneralActions.accountMismatchModalResolved,
    payload
});

export type TAccountMismatchModalResolvedAction = typeof accountMismatchModalResolved;
export interface ISetAccountMismatchModalPropertiesAction {
    type: GeneralActions.setAccountMismatchModalProperties;
    payload: {
        visibility: boolean;
    };
}

const setAccountMismatchModalProperties = (
    payload: ISetAccountMismatchModalPropertiesAction['payload']
) => ({
    type: GeneralActions.setAccountMismatchModalProperties,
    payload
});

export type TSetAccountMismatchModalPropertiesAction = typeof setAccountMismatchModalProperties;
export interface ISetNoAccountModalVisibilityAction {
    type: GeneralActions.setNoAccountModalVisibility;
    payload: boolean;
}
const setNoAccountModalVisibility = (payload: ISetNoAccountModalVisibilityAction['payload']) => ({
    type: GeneralActions.setNoAccountModalVisibility,
    payload
});

export type TSetNoAccountModalVisibilityAction = typeof setNoAccountModalVisibility;
export interface IRequestDeviceCreationAction {
    type: GeneralActions.requestDeviceCreation;
    payload: DeviceCreateData;
}
const requestDeviceCreation = (payload: IRequestDeviceCreationAction['payload']) => ({
    type: GeneralActions.requestDeviceCreation,
    payload
});

export type TRequestDeviceCreationAction = typeof requestDeviceCreation;
export interface ISetIRecClientAction {
    type: GeneralActions.setIRecClient;
    payload: IRecClient;
}
export type TSetIRecClientAction = typeof setIRecClient;
const setIRecClient = (payload: ISetIRecClientAction['payload']) => ({
    type: GeneralActions.setIRecClient,
    payload
});

export type IGeneralAction =
    | ISetLoadingAction
    | ISetErrorAction
    | ISetBackendClientAction
    | ISetEnvironmentAction
    | ISetExchangeClientAction
    | ISetOffchainConfigurationAction
    | ISetAccountMismatchModalPropertiesAction
    | ISetNoAccountModalVisibilityAction
    | IAccountMismatchModalResolvedAction
    | IRequestDeviceCreationAction
    | ISetIRecClientAction;

export const fromGeneralActions = {
    setLoading,
    setError,
    setBackendClient,
    setExchangeClient,
    setEnvironment,
    setOffchainConfiguration,
    setAccountMismatchModalProperties,
    accountMismatchModalResolved,
    requestDeviceCreation,
    setNoAccountModalVisibility,
    setIRecClient
};
