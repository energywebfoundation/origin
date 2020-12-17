import { IOrder } from '../IOrder';
import { IPriceStrategy } from './IPriceStrategy';

export class AskPriceStrategy implements IPriceStrategy {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pickPrice(ask: IOrder, bid: IOrder): number {
        return ask.price;
    }
}
