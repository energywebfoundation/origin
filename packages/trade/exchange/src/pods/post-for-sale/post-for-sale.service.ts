import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AccountService } from '../account/account.service';
import { IExternalDeviceService } from '../../interfaces/IExternalDeviceService';
import { OrderService } from '../order/order.service';
import { CreateAskDTO } from '../order/create-ask.dto';

@Injectable()
export class PostForSaleService<TProduct> {
    private readonly logger = new Logger(PostForSaleService.name);

    private deviceService: IExternalDeviceService;

    private issuerTypeId: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly accountService: AccountService,
        private readonly orderService: OrderService<TProduct>,
        private readonly moduleRef: ModuleRef
    ) {
        this.issuerTypeId = this.configService.get<string>('ISSUER_ID');
    }

    public async onModuleInit(): Promise<void> {
        this.logger.debug('onModuleInit');

        this.deviceService = this.moduleRef.get<IExternalDeviceService>(IExternalDeviceService, {
            strict: false
        });
    }

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

            const { postForSale, postForSalePrice } = await this.deviceService.getDeviceSettings({
                id: deviceId,
                type: this.issuerTypeId
            });
            const { userId } = await this.accountService.findByAddress(address);

            if (!postForSale) {
                this.logger.debug(`Device ${deviceId} does not have automaticPostForSale enabled`);
                return;
            }

            const ask: CreateAskDTO = {
                price: postForSalePrice,
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
