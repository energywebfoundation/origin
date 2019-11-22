import { IOffChainDataClient, IConfigurationClient } from '@energyweb/origin-backend-client';

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
    setEnvironment = 'GENERAL_SET_ENVIRONMENT'
}

export interface IEnvironment {
    MODE: string;
    BACKEND_URL: string;
    BLOCKCHAIN_EXPLORER_URL: string;
    WEB3: string;
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

export interface ISetEnvironmentAction {
    type: GeneralActions.setEnvironment;
    payload: IEnvironment;
}

export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: GeneralActions.setEnvironment,
    payload
});

export type TSetEnvironmentAction = typeof setEnvironment;

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
    | ISetEnvironmentAction;
