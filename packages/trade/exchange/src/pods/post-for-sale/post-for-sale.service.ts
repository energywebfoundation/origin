import { Injectable, Logger } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { CreateAskDTO } from '../order/create-ask.dto';
import { OrderService } from '../order/order.service';
import { SupplyService } from '../supply/supply.service';

@Injectable()
export class PostForSaleService<TProduct> {
    private readonly logger = new Logger(PostForSaleService.name);

    constructor(
        private readonly accountService: AccountService,
        private readonly orderService: OrderService<TProduct>,
        private readonly supplyService: SupplyService
    ) {}

    public async postForSale(
        deviceId: string,
        address: string,
        amount: string,
        assetId: string
    ): Promise<void> {
        try {
            this.logger.debug(
                `Trying to post for sale deviceId=${deviceId} sender=${address} amount=${amount} assetId=${assetId}`
            );
            const { userId } = await this.accountService.findByAddress(address);
            const supply = await this.supplyService.findByDeviceId(userId, deviceId);

            if (!supply?.active) {
                this.logger.debug(`Device ${deviceId} does not have supply enabled`);
                return;
            }

            const ask: CreateAskDTO = {
                price: supply.price,
                validFrom: new Date(),
                volume: amount,
                assetId
            };

            await this.orderService.createAsk(userId, ask);
        } catch (error) {
            this.logger.error(error.message);
        }
    }
}
