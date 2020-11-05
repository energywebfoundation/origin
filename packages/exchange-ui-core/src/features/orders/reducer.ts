import { Order, Demand, IExchangeClient } from '../../utils/exchange';
import { IOrderAction, OrdersActionsType } from './actions';

export interface IOrdersState {
    orders: Order[];
    demands: Demand[];
    exchangeClient: IExchangeClient;
}

const initialState: IOrdersState = {
    orders: [],
    demands: [],
    exchangeClient: null
};

export function ordersState<T>(
    state: IOrdersState = initialState,
    { type, payload }: IOrderAction
): IOrdersState {
    switch (type) {
        case OrdersActionsType.STORE_ORDERS:
            const orders = [...state.orders.filter((o) => o.id !== payload.id)];
            orders.push(payload);
            return {
                ...state,
                orders
            };
        case OrdersActionsType.CLEAR_ORDERS:
            return {
                ...state,
                orders: []
            };
        case OrdersActionsType.STORE_DEMANDS:
            return {
                ...state,
                demands: payload
            };
        case OrdersActionsType.CLEAR_DEMANDS:
            return {
                ...state,
                demands: []
            };
        case OrdersActionsType.SET_EXCHANGE_CLIENT:
            return { ...state, exchangeClient: payload.exchangeClient };
        default:
            return state;
    }
}
