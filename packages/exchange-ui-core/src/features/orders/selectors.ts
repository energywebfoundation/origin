import { IStoreState } from '../../types';
import { Order, Demand } from '../../utils/exchange';

export const getOrders = (state: IStoreState): Order[] => state.ordersState.orders;

export const getDemands = (state: IStoreState): Demand[] => state.ordersState.demands;
