import { Trade } from './Trade';
import { Ask } from './Ask';
import { DirectBuy } from './DirectBuy';
import { Bid } from './Bid';

export class TradeExecutedEvent {
    constructor(public trade: Trade, public ask: Ask, public bid: Bid | DirectBuy) {}
}
