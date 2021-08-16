import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';
import { NewTransactionProcessedEvent } from '../events/new-transaction-processed.event';
import { TransactionLogService } from '../transaction-log.service';
import { IssuerModuleOptions } from '../../../types';
import { ISSUER_MODULE_OPTIONS_TOKEN } from '../../../const';

@EventsHandler(NewTransactionProcessedEvent)
export class NewTransactionProcessedHandler implements IEventHandler<NewTransactionProcessedEvent> {
    constructor(
        private transactionLogService: TransactionLogService,
        private moduleRef: ModuleRef
    ) {}

    async handle({ data }: NewTransactionProcessedEvent): Promise<void> {
        const issuerOptions: IssuerModuleOptions = this.moduleRef.get(ISSUER_MODULE_OPTIONS_TOKEN, {
            strict: false
        });

        if (issuerOptions.enableTransactionLogging) {
            await this.transactionLogService.logEvent(data);
        }
    }
}
