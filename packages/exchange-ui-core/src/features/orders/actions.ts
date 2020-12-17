import { CreateDemandDTO } from '@energyweb/exchange-irec-client';
import { Order, Demand, CreateBidDTO, IDirectBuyDTO } from '../../utils/exchange';

export enum OrdersActionsType {
    STORE_ORDERS = 'ORDERS_STORE',
    CLEAR_ORDERS = 'ORDERS_CLEAR_ORDERS',
    CREATE_BID = 'ORDERS_CREATE_BID',
    CANCEL_ORDER = 'ORDERS_CANCEL_ORDER',
    STORE_DEMANDS = 'ORDERS_STORE_DEMANDS',
    CREATE_DEMAND = 'ORDERS_CREATE_DEMAND',
    UPDATE_DEMAND = 'ORDERS_UPDATE_DEMAND',
    PAUSE_DEMAND = 'ORDERS_PAUSE_DEMAND',
    RESUME_DEMAND = 'ORDERS_RESUME_DEMAND',
    ARCHIVE_DEMAND = 'ORDERS_ARCHIVE_DEMAND',
    CLEAR_DEMANDS = 'ORDERS_CLEAR_DEMANDS',
    FETCH_ORDERS = 'FETCH_ORDERS',
    DIRECT_BUY_ORDER = 'DIRECT_BUY_ORDER'
}

export interface IOrderAction {
    type: OrdersActionsType;
    payload?;
}

export interface IStoreOrderAction extends IOrderAction {
    payload: Order;
}

export interface ICreateBidAction extends IOrderAction {
    payload: CreateBidDTO;
}

export interface ICancelOrderAction extends IOrderAction {
    payload: Order;
}

export const storeOrder = (order: IStoreOrderAction['payload']): IStoreOrderAction => ({
    type: OrdersActionsType.STORE_ORDERS,
    payload: order
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

export const storeDemand = (demands: Demand[]): IStoreDemandAction => ({
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
