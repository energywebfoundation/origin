import { IStoreState } from '../../types';
import { Order } from '../../utils/exchange';

export const getOrders = (store: IStoreState): Order[] => store.orders.orders;
