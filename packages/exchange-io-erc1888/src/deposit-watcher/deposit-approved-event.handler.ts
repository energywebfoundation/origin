import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DepositApprovedEvent } from '@energyweb/exchange';
import { DepositWatcherService } from './deposit-watcher.service';

@EventsHandler(DepositApprovedEvent)
export class DepositApprovedEventHandler implements IEventHandler<DepositApprovedEvent> {
    private readonly logger = new Logger(DepositApprovedEventHandler.name);

    constructor(private readonly depositWatcherService: DepositWatcherService<string>) {}

    public async handle({
        deviceId,
        address,
        amount,
        assetId
    }: DepositApprovedEvent): Promise<void> {
        this.logger.debug(
            `Deposit approved event raised for sale deviceId=${deviceId} sender=${address} amount=${amount} assetId=${assetId}`
        );

        this.depositWatcherService.postForSale(deviceId, address, amount, assetId);
    }
}
