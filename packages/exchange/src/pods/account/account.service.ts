import { Injectable } from '@nestjs/common';
import BN from 'bn.js';
import { Map } from 'immutable';

import { Asset } from '../asset/asset.entity';
import { DepositService } from '../deposit/deposit.service';
import { TradeService } from '../trade/trade.service';
import { Account } from './account';
import { AccountAsset } from './account-asset';

@Injectable()
export class AccountService {
    constructor(
        private readonly tradeService: TradeService,
        private readonly depositService: DepositService
    ) {}

    public async get(userId: string) {
        const deposits = await this.depositService.getAll(userId);
        const trades = await this.tradeService.getAll(userId);

        const aggregatedDeposits = this.sumByAsset(
            deposits,
            deposit => deposit.asset,
            deposit => new BN(deposit.amount)
        );

        const aggregatedTrades = this.sumByAsset(
            trades,
            trade => trade.ask.asset,
            trade => {
                const sign = trade.ask.userId === userId ? -1 : 1;
                return new BN(trade.volume * sign);
            }
        );

        const aggregated = aggregatedDeposits.mergeWith(
            (deposit, trade) => ({ ...deposit, amount: deposit.amount.add(trade.amount) }),
            aggregatedTrades
        );

        return { userId, available: Array.from(aggregated.values()) } as Account;
    }

    private getUniqueAssetKey({ tokenId, address }: Asset) {
        return tokenId + address;
    }

    private sumByAsset<T>(
        records: T[],
        assetSelector: (t: T) => Asset,
        amountSelector: (t: T) => BN
    ): Map<string, AccountAsset> {
        return records.reduce((res, current) => {
            const asset = assetSelector(current);
            const currentAmount = amountSelector(current);

            const assetKey = this.getUniqueAssetKey(asset);
            const accountAsset = res.get(assetKey) || { asset, amount: new BN(0) };

            const amount = accountAsset.amount.add(currentAmount);

            return res.set(assetKey, { ...accountAsset, amount });
        }, Map<string, AccountAsset>());
    }
}
