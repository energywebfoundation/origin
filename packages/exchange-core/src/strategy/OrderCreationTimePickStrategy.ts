import { IPriceStrategy } from './IPriceStrategy';
import { Ask, Bid } from '..';

export class OrderCreationTimePickStrategy implements IPriceStrategy {
    pickPrice(ask: Ask, bid: Bid): number {
        return ask.createdAt > bid.createdAt ? bid.price : ask.price;
    }
}
