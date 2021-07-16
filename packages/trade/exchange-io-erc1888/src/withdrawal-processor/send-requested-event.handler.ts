import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendRequestedEvent } from '@energyweb/exchange';
import { WithdrawalProcessorService } from './withdrawal-processor.service';

@EventsHandler(SendRequestedEvent)
export class SendRequestedEventHandler {
    private readonly logger = new Logger(SendRequestedEventHandler.name);

    constructor(private readonly withdrawalProcessorService: WithdrawalProcessorService) {}

    async handle(event: SendRequestedEvent): Promise<void> {
        this.logger.log(`Received send requested event with transfer id=${event.transfer.id}`);
        this.withdrawalProcessorService.request(event.transfer);
    }
}
