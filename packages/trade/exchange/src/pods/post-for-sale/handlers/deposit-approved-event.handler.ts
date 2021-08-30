import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PostForSaleService } from '../post-for-sale.service';
import { DepositApprovedEvent } from '../../transfer/events/deposit-approved.event';

@EventsHandler(DepositApprovedEvent)
export class DepositApprovedEventHandler implements IEventHandler<DepositApprovedEvent> {
    private readonly logger = new Logger(DepositApprovedEventHandler.name);

    constructor(private readonly postForSaleService: PostForSaleService<string>) {}

    public async handle({
        deviceId,
        address,
        amount,
        assetId
    }: DepositApprovedEvent): Promise<void> {
        this.logger.debug(
            `Deposit approved event raised for sale deviceId=${deviceId} sender=${address} amount=${amount} assetId=${assetId}`
        );

        this.postForSaleService.postForSale(deviceId, address, amount, assetId);
    }
}
