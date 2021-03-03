import { CreateDemandDTO } from '@energyweb/exchange-irec-client';
import { Order, Demand, CreateBidDTO, IDirectBuyDTO } from '../../utils/exchange';

export enum OrdersActionsType {
    STORE_ORDERS = 'EXCHANGE_APP_ORDERS_STORE',
    CLEAR_ORDERS = 'EXCHANGE_APP_ORDERS_CLEAR_ORDERS',
    CREATE_BID = 'EXCHANGE_APP_ORDERS_CREATE_BID',
    CANCEL_ORDER = 'EXCHANGE_APP_ORDERS_CANCEL_ORDER',
    STORE_DEMANDS = 'EXCHANGE_APP_ORDERS_STORE_DEMANDS',
    CREATE_DEMAND = 'EXCHANGE_APP_ORDERS_CREATE_DEMAND',
    UPDATE_DEMAND = 'EXCHANGE_APP_ORDERS_UPDATE_DEMAND',
    PAUSE_DEMAND = 'EXCHANGE_APP_ORDERS_PAUSE_DEMAND',
    RESUME_DEMAND = 'EXCHANGE_APP_ORDERS_RESUME_DEMAND',
    ARCHIVE_DEMAND = 'EXCHANGE_APP_ORDERS_ARCHIVE_DEMAND',
    CLEAR_DEMANDS = 'EXCHANGE_APP_ORDERS_CLEAR_DEMANDS',
    FETCH_ORDERS = 'EXCHANGE_APP_FETCH_ORDERS',
    DIRECT_BUY_ORDER = 'EXCHANGE_APP_DIRECT_BUY_ORDER'
}

export interface IOrderAction {
    type: OrdersActionsType;
    payload?;
}

export interface IStoreOrdersAction extends IOrderAction {
    payload: Order[];
}

export interface ICreateBidAction extends IOrderAction {
    payload: CreateBidDTO;
}

export interface ICancelOrderAction extends IOrderAction {
    payload: Order;
}

export const storeOrders = (orders: IStoreOrdersAction['payload']): IStoreOrdersAction => ({
    type: OrdersActionsType.STORE_ORDERS,
    payload: orders
});

export const createBid = (bid: ICreateBidAction['payload']): ICreateBidAction => ({
    type: OrdersActionsType.CREATE_BID,
    payload: bid
});

export const clearOrders = (): IOrderAction => ({
    type: OrdersActionsType.CLEAR_ORDERS
});

export const cancelOrder = (order: Order): ICancelOrderAction => ({
    type: OrdersActionsType.CANCEL_ORDER,
    payload: order
});

export interface IStoreDemandAction extends IOrderAction {
    payload: Demand[];
}

export interface ICreateDemandAction extends IOrderAction {
    payload: CreateDemandDTO;
}

export interface IUpdateDemandAction extends IOrderAction {
    payload: { id: string; demand: CreateDemandDTO };
}

export interface IPauseDemandAction extends IOrderAction {
    payload: string;
}

export interface IResumeDemandAction extends IOrderAction {
    payload: string;
}

export interface IArchiveDemandAction extends IOrderAction {
    payload: Demand;
}

export interface IDirectBuyOrderAction extends IOrderAction {
    payload: IDirectBuyDTO;
}

export const storeDemands = (demands: Demand[]): IStoreDemandAction => ({
    type: OrdersActionsType.STORE_DEMANDS,
    payload: demands
});

export const createDemand = (demand: ICreateDemandAction['payload']): ICreateDemandAction => ({
    type: OrdersActionsType.CREATE_DEMAND,
    payload: demand
});

export const updateDemand = (id: string, demand: CreateDemandDTO): IUpdateDemandAction => ({
    type: OrdersActionsType.UPDATE_DEMAND,
    payload: { id, demand }
});

export const pauseDemand = (id: IPauseDemandAction['payload']): IPauseDemandAction => ({
    type: OrdersActionsType.PAUSE_DEMAND,
    payload: id
});

export const resumeDemand = (id: IResumeDemandAction['payload']): IResumeDemandAction => ({
    type: OrdersActionsType.RESUME_DEMAND,
    payload: id
});

export const archiveDemand = (demand: Demand): IArchiveDemandAction => ({
    type: OrdersActionsType.ARCHIVE_DEMAND,
    payload: demand
});

export const clearDemands = (): IOrderAction => ({
    type: OrdersActionsType.CLEAR_DEMANDS
});

export const fetchOrders = (): IOrderAction => ({
    type: OrdersActionsType.FETCH_ORDERS
});

export const directBuyOrder = (payload: IDirectBuyDTO): IDirectBuyOrderAction => ({
    type: OrdersActionsType.DIRECT_BUY_ORDER,
    payload
});
