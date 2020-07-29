import { IPriceStrategy } from './IPriceStrategy';
import { Ask, Bid } from '..';

export class AskPriceStrategy implements IPriceStrategy {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pickPrice(ask: Ask, bid: Bid): number {
        return ask.price;
    }
}
