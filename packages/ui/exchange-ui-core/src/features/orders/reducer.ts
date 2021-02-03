import { Order, Demand } from '../../utils/exchange';
import { IOrderAction, OrdersActionsType } from './actions';

export interface IOrdersState {
    orders: Order[];
    demands: Demand[];
}

const initialState: IOrdersState = {
    orders: null,
    demands: null
};

export function ordersState<T>(
    state: IOrdersState = initialState,
    { type, payload }: IOrderAction
): IOrdersState {
    switch (type) {
        case OrdersActionsType.STORE_ORDERS:
            const allOrders: Order[] = [...state.orders].concat(payload);
            const set: Set<string> = new Set();
            allOrders.forEach((order) => {
                set.add(JSON.stringify(order));
            });
            const orders: Order[] = Array.from(set).map((order) => JSON.parse(order));
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
        default:
            return state;
    }
}
