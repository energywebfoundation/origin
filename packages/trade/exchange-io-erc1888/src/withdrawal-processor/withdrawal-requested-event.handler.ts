import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WithdrawalRequestedEvent } from '@energyweb/exchange';
import { WithdrawalProcessorService } from './withdrawal-processor.service';

@EventsHandler(WithdrawalRequestedEvent)
export class WithdrawalRequestedEventHandler {
    private readonly logger = new Logger(WithdrawalRequestedEventHandler.name);

    constructor(private readonly withdrawalProcessorService: WithdrawalProcessorService) {}

    async handle(event: WithdrawalRequestedEvent): Promise<void> {
        this.logger.log(
            `Received withdrawal requested event with transfer id=${event.transfer.id}`
        );
        this.withdrawalProcessorService.requestWithdrawal(event.transfer);
    }
}
