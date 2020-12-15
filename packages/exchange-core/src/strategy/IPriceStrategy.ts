import { IOrder } from '../Order';

export interface IPriceStrategy {
    pickPrice(ask: IOrder, bid: IOrder): number;
}
