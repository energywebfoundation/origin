import { OrderSide } from '@energyweb/exchange-core';
import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(AccountBalanceService.name);

    constructor(
        private readonly tradeService: TradeService,
        private readonly transferService: TransferService,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService
    ) {}

    public async getAccountBalance(userId: string): Promise<AccountBalance> {
        this.logger.debug(`[UserId: ${userId}] Requested account balance:`);

        const deposits = await this.getTransfers(userId);
        const trades = await this.getTrades(userId);
        const sellOrders = await this.getSellOrders(userId);

        const sum = (oldVal: AccountAsset, newVal: AccountAsset) => ({
            ...oldVal,
            amount: oldVal.amount.add(newVal.amount)
        });

        const available = deposits.mergeWith(sum, trades).mergeWith(sum, sellOrders);

        const balances = new AccountBalance({
            available: Array.from(available.values()).filter((asset) => asset.amount.gt(new BN(0))),
            locked: Array.from(sellOrders.values()).map(
                (asset) => new AccountAsset({ ...asset, amount: asset.amount.abs() })
            )
        });

        this.logger.debug(`[UserId: ${userId}] Balances: ${JSON.stringify(balances)}`);

        return balances;
    }

    public async hasEnoughAssetAmount(userId: string, assetId: string, assetAmount: string) {
        this.logger.debug(
            `Checking available amount for user ${userId} asset ${assetId} amount ${assetAmount}`
        );

        const { available } = await this.getAccountBalance(userId);
        const accountAsset = available.find(({ asset }) => asset.id === assetId);

        this.logger.debug(`Available amount is ${accountAsset?.amount.toString(10) ?? 0}`);

        return accountAsset && accountAsset.amount.gte(new BN(assetAmount));
    }

    private async getSellOrders(userId: string) {
        const sellOrders = await this.orderService.getActiveOrdersBySide(userId, OrderSide.Ask);

        return this.sumByAsset(
            sellOrders,
            (order) => order.asset,
            (order) => new BN(order.currentVolume.muln(-1))
        );
    }

    private async getTransfers(userId: string) {
        const transfers = await this.transferService.getAllCompleted(userId);

        return this.sumByAsset(
            transfers,
            (transfer) => transfer.asset,
            (transfer) => {
                const sign = transfer.direction === TransferDirection.Withdrawal ? -1 : 1;
                return new BN(transfer.amount).mul(new BN(sign));
            }
        );
    }

    private async getTrades(userId: string) {
        const trades = await this.tradeService.getAll(userId, false);

        return this.sumByAsset(
            trades,
            (trade) => trade.ask.asset,
            (trade) => {
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

            return res.set(id, new AccountAsset({ ...accountAsset, amount }));
        }, Map<string, AccountAsset>());
    }
}
