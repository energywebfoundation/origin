import { Ask, Bid } from '..';

export interface IPriceStrategy {
    pickPrice(ask: Ask, bid: Bid): number;
}
