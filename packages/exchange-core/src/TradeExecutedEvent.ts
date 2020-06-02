import { Trade } from './Trade';

export class TradeExecutedEvent {
    constructor(public readonly trade: Trade) {}
}
