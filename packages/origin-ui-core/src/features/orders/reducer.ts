import { Order } from '../../utils/exchange';
import { IOrderAction, OrdersActionsType } from './actions';

export interface IOrdersState {
    orders: Order[];
}

const initialState: IOrdersState = {
    orders: []
};

export default function reducer<T>(
    state: IOrdersState = initialState,
    { type, payload }: IOrderAction
): IOrdersState {
    switch (type) {
        case OrdersActionsType.STORE:
            const orders = [...state.orders.filter((o) => o.id !== payload.id)];
            orders.push(payload);
            return {
                ...state,
                orders
            };
        case OrdersActionsType.CLEAR:
            return {
                ...state,
                orders: []
            };
        default:
            return state;
    }
}
