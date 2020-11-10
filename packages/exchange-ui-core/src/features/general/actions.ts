import { IExchangeClient } from '../../utils/exchange';

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

export enum ExchangeGeneralActionType {
    SET_EXCHANGE_CLIENT = 'ORDERS_SET_EXCHANGE_CLIENT',
    SET_ENVIRONMENT = 'SET_ENVIRONMENT',
    INITIALIZE_EXCHANGE_APP = 'INITIALIZE_EXCHANGE_APP'
}

export interface IExchangeGeneralAction {
    type: ExchangeGeneralActionType;
    payload?;
}

// Environment
export interface ISetEnvironmentAction {
    type: ExchangeGeneralActionType.SET_ENVIRONMENT;
    payload: IEnvironment;
}
export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: ExchangeGeneralActionType.SET_ENVIRONMENT,
    payload
});
export type TSetEnvironmentAction = typeof setEnvironment;
// Environment

// Client
export interface ISetExchangeClientAction extends IExchangeGeneralAction {
    payload: {
        exchangeClient: IExchangeClient;
    };
}
export const setExchangeClient = (payload: ISetExchangeClientAction['payload']) => ({
    type: ExchangeGeneralActionType.SET_EXCHANGE_CLIENT,
    payload
});
// Client

// Initialize
export interface IInitialiazeAppAction {
    type: ExchangeGeneralActionType.INITIALIZE_EXCHANGE_APP;
    payload: boolean;
}
