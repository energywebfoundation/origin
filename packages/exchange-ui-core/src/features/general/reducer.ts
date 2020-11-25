import { ExchangeClient } from '../../utils/exchange';
import { ExchangeGeneralActionType, IExchangeGeneralAction, IEnvironment } from './actions';

export interface IExchangeGeneralState {
    exchangeClient: ExchangeClient;
    environment: IEnvironment;
}

const initialState: IExchangeGeneralState = {
    exchangeClient: null,
    environment: null
};

export function exchangeGeneralState<T>(
    state: IExchangeGeneralState = initialState,
    { type, payload }: IExchangeGeneralAction
): IExchangeGeneralState {
    switch (type) {
        case ExchangeGeneralActionType.SET_EXCHANGE_CLIENT:
            return { ...state, exchangeClient: payload.exchangeClient };
        case ExchangeGeneralActionType.SET_ENVIRONMENT:
            return { ...state, environment: payload };
        default:
            return state;
    }
}
