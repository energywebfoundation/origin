import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ClaimRequestedEvent } from '@energyweb/exchange';
import { WithdrawalProcessorService } from './withdrawal-processor.service';

@EventsHandler(ClaimRequestedEvent)
export class ClaimRequestedEventHandler {
    private readonly logger = new Logger(ClaimRequestedEventHandler.name);

    constructor(private readonly withdrawalProcessorService: WithdrawalProcessorService) {}

    async handle(event: ClaimRequestedEvent): Promise<void> {
        this.logger.log(`Received claim requested event with transfer id=${event.transfer.id}`);
        this.withdrawalProcessorService.request(event.transfer);
    }
}
