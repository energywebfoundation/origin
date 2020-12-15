import { IOrder } from '../Order';
import { IPriceStrategy } from './IPriceStrategy';

export class OrderCreationTimePickStrategy implements IPriceStrategy {
    pickPrice(ask: IOrder, bid: IOrder): number {
        return ask.createdAt > bid.createdAt ? bid.price : ask.price;
    }
}
