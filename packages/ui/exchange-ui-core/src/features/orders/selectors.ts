import { IExchangeState } from '../../types';
import { Order, Demand } from '../../utils/exchange';

export const getOrders = (state: IExchangeState): Order[] => state.ordersState.orders;

export const getDemands = (state: IExchangeState): Demand[] => state.ordersState.demands;
