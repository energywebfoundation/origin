import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { NewTransactionProcessedEvent } from '../events/new-transaction-processed.event';
import { TransactionLogService } from '../transaction-log.service';

@EventsHandler(NewTransactionProcessedEvent)
export class NewTransactionProcessedHandler implements IEventHandler<NewTransactionProcessedEvent> {
    constructor(private transactionLogService: TransactionLogService) {}

    async handle({ data }: NewTransactionProcessedEvent): Promise<void> {
        await this.transactionLogService.logEvent(data);
    }
}
