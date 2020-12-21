import { IOrder } from '../IOrder';

export interface IPriceStrategy {
    pickPrice(ask: IOrder, bid: IOrder): number;
}
