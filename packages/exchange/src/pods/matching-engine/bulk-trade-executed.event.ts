import { TradeExecutedEvent } from '@energyweb/exchange-core';
import { List } from 'immutable';

export class BulkTradeExecutedEvent {
    constructor(public events: List<TradeExecutedEvent>) {}
}
