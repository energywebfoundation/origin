import {
    IOffChainDataClient,
    IConfigurationClient,
    IOrganizationClient,
    IUserClient,
    IDeviceClient
} from '@energyweb/origin-backend-client';

export enum GeneralActions {
    showAccountChangedModal = 'SHOW_ACCOUNT_CHANGED_MODAL',
    hideAccountChangedModal = 'HIDE_ACCOUNT_CHANGED_MODAL',
    disableAccountChangedModal = 'DISABLE_ACCOUNT_CHANGED_MODAL',
    setLoading = 'GENERAL_SET_LOADING',
    setError = 'GENERAL_SET_ERROR',
    showRequestPasswordModal = 'SHOW_REQUEST_PASSWORD_MODAL',
    hideRequestPasswordModal = 'HIDE_REQUEST_PASSWORD_MODAL',
    setOffChainDataClient = 'GENERAL_SET_OFF_CHAIN_DATA_CLIENT',
    setConfigurationClient = 'GENERAL_SET_CONFIGURATION_CLIENT',
    setOrganizationClient = 'GENERAL_SET_ORGANIZATION_CLIENT',
    setUserClient = 'GENERAL_SET_USER_CLIENT',
    setDeviceClient = 'GENERAL_SET_DEVICE_CLIENT',
    setEnvironment = 'GENERAL_SET_ENVIRONMENT',
    setCurrencies = 'GENERAL_SET_CURRENCIES',
    setCompliance = 'GENERAL_SET_COMPLIANCE',
    setCountry = 'GENERAL_SET_COUNTRY',
    setRegions = 'GENERAL_SET_REGIONS'
}

export interface IEnvironment {
    MODE: string;
    BACKEND_URL: string;
    BLOCKCHAIN_EXPLORER_URL: string;
    WEB3: string;
    REGISTRATION_MESSAGE_TO_SIGN: string;
}

export interface IShowAccountChangedModalAction {
    type: GeneralActions.showAccountChangedModal;
}

export const showAccountChangedModal = () => ({
    type: GeneralActions.showAccountChangedModal
});

export type TShowAccountChangedModal = typeof showAccountChangedModal;

export interface IHideAccountChangedModalAction {
    type: GeneralActions.hideAccountChangedModal;
}

export const hideAccountChangedModal = () => ({
    type: GeneralActions.hideAccountChangedModal
});

export type THideAccountChangedModal = typeof hideAccountChangedModal;

export interface IDisableAccountChangedModalAction {
    type: GeneralActions.disableAccountChangedModal;
}

export const disableAccountChangedModal = () => ({
    type: GeneralActions.disableAccountChangedModal
});

export type TDisableAccountChangedModal = typeof disableAccountChangedModal;

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

export interface IRequestPasswordModalAction {
    type: GeneralActions.showRequestPasswordModal;
    payload: {
        title?: string;
        callback: (password: string) => void;
    };
}

export const showRequestPasswordModal = (payload: IRequestPasswordModalAction['payload']) => ({
    type: GeneralActions.showRequestPasswordModal,
    payload
});

export type TShowRequestPasswordModal = typeof showRequestPasswordModal;

export interface IHideRequestPasswordModalAction {
    type: GeneralActions.hideRequestPasswordModal;
}

export const hideRequestPasswordModal = () => ({
    type: GeneralActions.hideRequestPasswordModal
});

export type THideRequestPasswordModalAction = typeof hideRequestPasswordModal;

export interface ISetOffChainDataClientAction {
    type: GeneralActions.setOffChainDataClient;
    payload: IOffChainDataClient;
}

export const setOffChainDataClient = (payload: ISetOffChainDataClientAction['payload']) => ({
    type: GeneralActions.setOffChainDataClient,
    payload
});

export type TSetOffChainDataClientAction = typeof setOffChainDataClient;

export interface ISetConfigurationClientAction {
    type: GeneralActions.setConfigurationClient;
    payload: IConfigurationClient;
}

export const setConfigurationClient = (payload: ISetConfigurationClientAction['payload']) => ({
    type: GeneralActions.setConfigurationClient,
    payload
});

export type TSetConfigurationClientAction = typeof setConfigurationClient;

export interface ISetOrganizationClientAction {
    type: GeneralActions.setOrganizationClient;
    payload: IOrganizationClient;
}

export const setOrganizationClient = (payload: ISetOrganizationClientAction['payload']) => ({
    type: GeneralActions.setOrganizationClient,
    payload
});

export type TSetOrganizationClientAction = typeof setOrganizationClient;

export interface ISetUserClientAction {
    type: GeneralActions.setUserClient;
    payload: IUserClient;
}

export const setUserClient = (payload: ISetUserClientAction['payload']) => ({
    type: GeneralActions.setUserClient,
    payload
});

export type TSetUserClientAction = typeof setUserClient;

export interface ISetDeviceClientAction {
    type: GeneralActions.setDeviceClient;
    payload: IDeviceClient;
}

export const setDeviceClient = (payload: ISetDeviceClientAction['payload']) => ({
    type: GeneralActions.setDeviceClient,
    payload
});

export type TSetDeviceClientAction = typeof setDeviceClient;

export interface ISetEnvironmentAction {
    type: GeneralActions.setEnvironment;
    payload: IEnvironment;
}

export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: GeneralActions.setEnvironment,
    payload
});

export type TSetEnvironmentAction = typeof setEnvironment;

export interface ISetCurrenciesAction {
    type: GeneralActions.setCurrencies;
    payload: {
        currencies: string[];
    };
}

export const setCurrencies = (payload: ISetCurrenciesAction['payload']) => ({
    type: GeneralActions.setCurrencies,
    payload
});

export type TSetCurrencies = typeof setCurrencies;

export interface ISetComplianceAction {
    type: GeneralActions.setCompliance;
    payload: string;
}

export const setCompliance = (payload: ISetComplianceAction['payload']) => ({
    type: GeneralActions.setCompliance,
    payload
});

export type TSetCompliance = typeof setCompliance;

export interface ISetCountryAction {
    type: GeneralActions.setCountry;
    payload: string;
}

export const setCountry = (payload: ISetCountryAction['payload']) => ({
    type: GeneralActions.setCountry,
    payload
});

export type TSetCountry = typeof setCountry;

export interface ISetRegionsAction {
    type: GeneralActions.setRegions;
    payload: object;
}

export const setRegions = (payload: ISetRegionsAction['payload']) => ({
    type: GeneralActions.setRegions,
    payload
});

export type TSetRegions = typeof setRegions;

export type IGeneralAction =
    | IShowAccountChangedModalAction
    | IHideAccountChangedModalAction
    | IDisableAccountChangedModalAction
    | ISetLoadingAction
    | ISetErrorAction
    | IRequestPasswordModalAction
    | IHideRequestPasswordModalAction
    | ISetOffChainDataClientAction
    | ISetConfigurationClientAction
    | ISetEnvironmentAction
    | ISetCurrenciesAction
    | ISetComplianceAction
    | ISetCountryAction
    | ISetRegionsAction
    | ISetOrganizationClientAction
    | ISetUserClientAction
    | ISetDeviceClientAction;
