import { ExchangeClient } from '../..';

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
}

export enum ExchangeGeneralActionType {
    SET_EXCHANGE_CLIENT = 'EXCHANGE_APP_ORDERS_SET_EXCHANGE_CLIENT',
    SET_ENVIRONMENT = 'EXCHANGE_APP_SET_ENVIRONMENT',
    INITIALIZE_EXCHANGE_APP = 'EXCHANGE_APP_INITIALIZE_EXCHANGE_APP'
}

export interface IExchangeGeneralAction {
    type: ExchangeGeneralActionType;
    payload?;
}

export interface ISetEnvironmentAction {
    type: ExchangeGeneralActionType.SET_ENVIRONMENT;
    payload: IEnvironment;
}
export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: ExchangeGeneralActionType.SET_ENVIRONMENT,
    payload
});
export type TSetEnvironmentAction = typeof setEnvironment;

export interface ISetExchangeClientAction extends IExchangeGeneralAction {
    payload: {
        exchangeClient: ExchangeClient;
    };
}
export const setExchangeClient = (payload: ISetExchangeClientAction['payload']) => ({
    type: ExchangeGeneralActionType.SET_EXCHANGE_CLIENT,
    payload
});

export const initializeExchangeApp = (): IExchangeGeneralAction => ({
    type: ExchangeGeneralActionType.INITIALIZE_EXCHANGE_APP
});
