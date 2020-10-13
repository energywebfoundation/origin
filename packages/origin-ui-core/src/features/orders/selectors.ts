import { IStoreState } from '../../types';
import { Order, Demand } from '../../utils/exchange';

export const getOrders = (store: IStoreState): Order[] => store.orders.orders;

export const getDemands = (store: IStoreState): Demand[] => store.orders.demands;
