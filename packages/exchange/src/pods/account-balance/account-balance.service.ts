import { OrderSide } from '@energyweb/exchange-core';
import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import BN from 'bn.js';
import { Map } from 'immutable';

import { OrderService } from '../order/order.service';
import { TradeService } from '../trade/trade.service';
import { TransferDirection } from '../transfer/transfer-direction';
import { TransferService } from '../transfer/transfer.service';
import { AccountAssetDTO } from './account-asset.dto';
import { AccountBalanceDTO } from './account-balance.dto';
import { Asset } from '../asset/asset.entity';
import { BundleService } from '../bundle/bundle.service';
import { Bundle } from '../bundle/bundle.entity';

export type AssetAmount = { id: string; amount: BN };

@Injectable()
export class AccountBalanceService {
    private readonly logger = new Logger(AccountBalanceService.name);

    constructor(
        private readonly tradeService: TradeService,
        private readonly transferService: TransferService,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService,
        @Inject(forwardRef(() => BundleService))
        private readonly bundleService: BundleService
    ) {}

    public async getAccountBalance(userId: string): Promise<AccountBalanceDTO> {
        this.logger.debug(`[UserId: ${userId}] Requested account balance:`);

        const transfers = await this.getTransfers(userId);
        const trades = await this.getTrades(userId);
        const sellOrders = await this.getSellOrders(userId);

        const userBundles = await this.getUserBundles(userId);
        const inBundlesLocked = await this.getAssetsLockedInBundles(userBundles, false);
        const inBundlesAvailable = await this.getAssetsLockedInBundles(userBundles, true);
        const fromBundles = await this.getAssetsFromBundles(userId);

        const sum = (oldVal: AccountAssetDTO, newVal: AccountAssetDTO) => ({
            ...oldVal,
            amount: oldVal.amount.add(newVal.amount)
        });

        const available = transfers
            .mergeWith(sum, trades)
            .mergeWith(sum, sellOrders)
            .mergeWith(sum, fromBundles)
            .mergeWith(sum, inBundlesAvailable);

        const locked = sellOrders.mergeWith(sum, inBundlesLocked);

        const balances = new AccountBalanceDTO({
            available: Array.from(available.values()).filter((asset) => asset.amount.gt(new BN(0))),
            locked: Array.from(locked.values()).map(
                (asset) => new AccountAssetDTO({ ...asset, amount: asset.amount.abs() })
            )
        });

        this.logger.debug(`[UserId: ${userId}] Balances: ${JSON.stringify(balances)}`);

        return balances;
    }

    public async hasEnoughAssetAmount(userId: string, ...assets: AssetAmount[]) {
        this.logger.debug(
            `Checking available amount for user ${userId} asset ${assets.map(
                (a) => a.id
            )} amount ${assets.map((a) => a.amount.toString(10))}`
        );

        const { available } = await this.getAccountBalance(userId);

        return assets.every(({ id, amount }) => {
            const accountAsset = available.find(({ asset }) => asset.id === id);

            this.logger.debug(`Available amount is ${accountAsset?.amount.toString(10) ?? 0}`);

            return accountAsset && accountAsset.amount.gte(amount);
        });
    }

    private async getUserBundles(userId: string) {
        return this.bundleService.getByUser(userId, { isCancelled: false });
    }

    private async getAssetsLockedInBundles(bundles: Bundle[], initialVolume: boolean) {
        const items = bundles.flatMap((bundle) => bundle.items);

        return this.sumByAsset(
            items,
            (bundle) => bundle.asset,
            (order) => (initialVolume ? order.startVolume.muln(-1) : order.currentVolume.muln(-1))
        );
    }

    private async getAssetsFromBundles(userId: string) {
        const trades = await this.bundleService.getTrades(userId);
        const items = trades.flatMap((trade) => trade.items);

        return this.sumByAsset(
            items,
            (bundle) => bundle.asset,
            (order) => order.volume
        );
    }

    private async getSellOrders(userId: string) {
        const sellOrders = await this.orderService.getActiveOrdersBySide(userId, OrderSide.Ask);

        return this.sumByAsset(
            sellOrders,
            (order) => order.asset,
            (order) => order.currentVolume.muln(-1)
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
        const trades = await this.tradeService.getAllByUser(userId, false);

        return this.sumByAsset(
            trades,
            (trade) => trade.ask.asset,
            (trade) => {
                const sign = trade.ask.userId === userId ? -1 : 1;
                return trade.volume.muln(sign);
            }
        );
    }

    private sumByAsset<T>(
        records: T[],
        assetSelector: (t: T) => Asset,
        amountSelector: (t: T) => BN
    ): Map<string, AccountAssetDTO> {
        return records.reduce((res, current) => {
            const asset = assetSelector(current);
            const { id } = asset;
            const currentAmount = amountSelector(current);

            const accountAsset = res.get(id) || { asset, amount: new BN(0) };

            const amount = accountAsset.amount.add(currentAmount);

            return res.set(id, new AccountAssetDTO({ ...accountAsset, amount }));
        }, Map<string, AccountAssetDTO>());
    }
}
