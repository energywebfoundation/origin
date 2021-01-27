import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DepositedEvent } from '@energyweb/exchange';
import { DepositWatcherService } from './deposit-watcher.service';

@EventsHandler(DepositedEvent)
export class DepositedEventHandler {
    private readonly logger = new Logger(DepositedEventHandler.name);

    constructor(private readonly depositWatcherService: DepositWatcherService<string>) {}

    async handle(event: DepositedEvent): Promise<void> {
        this.logger.log(`Received deposit event with transfer id=${event.transfer.id}`);
        this.depositWatcherService.requestDeposit(event.transfer);
    }
}
