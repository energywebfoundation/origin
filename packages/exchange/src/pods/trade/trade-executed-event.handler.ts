import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { BulkTradeExecutedEvent } from '../matching-engine/bulk-trade-executed.event';
import { TradeService } from './trade.service';

@EventsHandler(BulkTradeExecutedEvent)
export class TradeExecutedEventHandler<TProduct, TProductFilter>
    implements IEventHandler<BulkTradeExecutedEvent> {
    private readonly logger = new Logger(TradeExecutedEventHandler.name);

    constructor(private readonly tradeService: TradeService<TProduct, TProductFilter>) {}

    async handle(event: BulkTradeExecutedEvent) {
        this.logger.debug(`Received trade executed events ${JSON.stringify(event)}`);

        await this.tradeService.persist(event.events);
    }
}
