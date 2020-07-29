import { Trade } from './trade.entity';

export class TradePersistedEvent {
    constructor(public readonly trade: Trade) {}
}
