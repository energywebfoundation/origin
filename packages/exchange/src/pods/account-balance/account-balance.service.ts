import { OrderSide } from '@energyweb/exchange-core';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import BN from 'bn.js';
import { Map } from 'immutable';

import { OrderService } from '../order/order.service';
import { TradeService } from '../trade/trade.service';
import { TransferDirection } from '../transfer/transfer-direction';
import { TransferService } from '../transfer/transfer.service';
import { AccountAsset } from './account-asset';
import { AccountBalance } from './account-balance';
import { Asset } from '../asset/asset.entity';

@Injectable()
export class AccountBalanceService {
    constructor(
        private readonly tradeService: TradeService,
        private readonly transferService: TransferService,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService
    ) {}

    public async getAccountBalance(userId: string): Promise<AccountBalance> {
        const deposits = await this.getTransfers(userId);
        const trades = await this.getTrades(userId);
        const sellOrders = await this.getSellOrders(userId);

        const sum = (oldVal: AccountAsset, newVal: AccountAsset) => ({
            ...oldVal,
            amount: oldVal.amount.add(newVal.amount)
        });

        const aggregated = deposits.mergeWith(sum, trades).mergeWith(sum, sellOrders);

        return {
            available: Array.from(aggregated.values()),
            locked: Array.from(sellOrders.values())
        };
    }

    public async hasEnoughAssetAmount(userId: string, assetId: string, assetAmount: string) {
        const { available } = await this.getAccountBalance(userId);
        const accountAsset = available.find(({ asset }) => asset.id === assetId);

        return accountAsset && accountAsset.amount.gte(new BN(assetAmount));
    }

    private async getSellOrders(userId: string) {
        const sellOrders = await this.orderService.getActiveOrdersBySide(userId, OrderSide.Ask);

        return this.sumByAsset(
            sellOrders,
            order => order.asset,
            order => new BN(order.currentVolume.muln(-1))
        );
    }

    private async getTransfers(userId: string) {
        const transfers = await this.transferService.getAllCompleted(userId);

        return this.sumByAsset(
            transfers,
            transfer => transfer.asset,
            transfer => {
                const sign = transfer.direction === TransferDirection.Withdrawal ? -1 : 1;
                return new BN(transfer.amount).mul(new BN(sign));
            }
        );
    }

    private async getTrades(userId: string) {
        const trades = await this.tradeService.getAll(userId);

        return this.sumByAsset(
            trades,
            trade => trade.ask.asset,
            trade => {
                const sign = trade.ask.userId === userId ? -1 : 1;
                return new BN(trade.volume.muln(sign));
            }
        );
    }

    private sumByAsset<T>(
        records: T[],
        assetSelector: (t: T) => Asset,
        amountSelector: (t: T) => BN
    ): Map<string, AccountAsset> {
        return records.reduce((res, current) => {
            const asset = assetSelector(current);
            const { id } = asset;
            const currentAmount = amountSelector(current);

            const accountAsset = res.get(id) || { asset, amount: new BN(0) };

            const amount = accountAsset.amount.add(currentAmount);

            return res.set(id, { ...accountAsset, amount });
        }, Map<string, AccountAsset>());
    }
}
