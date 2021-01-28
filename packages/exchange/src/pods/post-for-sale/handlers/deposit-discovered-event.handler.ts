import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DepositDiscoveredEvent } from '../../transfer/deposit-discovered.event';
import { TransferService } from '../../transfer/transfer.service';

@EventsHandler(DepositDiscoveredEvent)
export class DepositDiscoveredEventHandler implements IEventHandler<DepositDiscoveredEvent> {
    private readonly logger = new Logger(DepositDiscoveredEventHandler.name);

    constructor(private readonly transferService: TransferService) {}

    public async handle(event: DepositDiscoveredEvent): Promise<void> {
        const { address, amount, asset } = event.deposit;
        this.logger.debug(
            `Deposit discovered event raised for deposit with tokenId=${asset.tokenId} from=${address} with value=${amount}`
        );

        this.transferService.storeDeposit(event.deposit);
    }
}
