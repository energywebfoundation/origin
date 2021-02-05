import { OrderSide } from '@energyweb/exchange-core';
import { Injectable } from '@nestjs/common';
import { Map } from 'immutable';

import {
    AccountAssetDTO,
    AccountBalanceAssetService,
    AccountBalanceService
} from '../account-balance';
import { OrderService } from './order.service';

@Injectable()
export class OrderAccountingService<TProduct> extends AccountBalanceAssetService {
    constructor(
        private readonly orderService: OrderService<TProduct>,
        accountBalanceService: AccountBalanceService
    ) {
        super();
        accountBalanceService.registerAssetSource(this);
    }

    public async lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const sellOrders = await this.orderService.getActiveOrdersBySide(ownerId, OrderSide.Ask);

        return this.sumByAsset(
            sellOrders,
            (order) => order.asset,
            (order) => order.currentVolume
        );
    }

    public async availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const sellOrders = await this.orderService.getActiveOrdersBySide(ownerId, OrderSide.Ask);

        return this.sumByAsset(
            sellOrders,
            (order) => order.asset,
            (order) => order.currentVolume.muln(-1)
        );
    }
}
