import { Order } from '../../utils/exchange';

export enum OrdersActionsType {
    STORE = 'ORDERS_STORE',
    CLEAR = 'ORDERS_CLREAR_ORDERS',
    CANCEL = 'ORDERS_CANCEL_ORDERS'
}

export interface IOrderAction {
    type: OrdersActionsType;
    payload?;
}

export interface IStoreOrderAction extends IOrderAction {
    payload: Order;
}

export interface ICancelOrderAction extends IOrderAction {
    payload: Order;
}

export const storeOrder = (order: IStoreOrderAction['payload']): IStoreOrderAction => ({
    type: OrdersActionsType.STORE,
    payload: order
});

export const clearOrders = (): IOrderAction => ({
    type: OrdersActionsType.CLEAR
});

export const cancelOrder = (order: Order): ICancelOrderAction => ({
    type: OrdersActionsType.CANCEL,
    payload: order
});
