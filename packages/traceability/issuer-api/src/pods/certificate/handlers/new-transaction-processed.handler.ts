import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NewTransactionProcessedEvent } from '../events/new-transaction-processed.event';
import { TransactionLogService } from '../transaction-log.service';
import { IssuerModuleOptions, ISSUER_MODULE_OPTIONS_TOKEN } from '../../options';

@EventsHandler(NewTransactionProcessedEvent)
export class NewTransactionProcessedHandler implements IEventHandler<NewTransactionProcessedEvent> {
    constructor(
        private transactionLogService: TransactionLogService,
        @Inject(ISSUER_MODULE_OPTIONS_TOKEN)
        private issuerOptions: IssuerModuleOptions
    ) {}

    async handle({ data }: NewTransactionProcessedEvent): Promise<void> {
        if (this.issuerOptions.enableTransactionLogging) {
            await this.transactionLogService.logEvent(data);
        }
    }
}
