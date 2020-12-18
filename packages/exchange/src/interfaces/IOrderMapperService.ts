import { IMatchableOrder } from '@energyweb/exchange-core';
import { Order } from '../pods/order/order.entity';

export interface IOrderMapperService<TProduct, TProductFilter> {
    map(order: Order): Promise<IMatchableOrder<TProduct, TProductFilter>>;
}

export const IOrderMapperService = Symbol('IOrderMapperService');
