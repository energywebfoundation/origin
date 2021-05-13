import { Injectable, Logger } from '@nestjs/common';
import BN from 'bn.js';
import { Map } from 'immutable';

import { AccountAssetDTO } from './account-asset.dto';
import { IAccountableAsset } from './account-balance-asset.service';
import { AccountBalanceDTO } from './account-balance.dto';

export type AssetAmount = { id: string; amount: BN };

@Injectable()
export class AccountBalanceService {
    private readonly logger = new Logger(AccountBalanceService.name);

    private assetSources = Array<IAccountableAsset>();

    public registerAssetSource(source: IAccountableAsset): void {
        const { name } = source.constructor;

        this.logger.debug(`Registering asset source: ${name}`);

        if (this.assetSources.find((i) => i.constructor.name === name)) {
            this.logger.debug('Asset source already registered');
            return;
        }

        this.assetSources.push(source);
    }

    public async getAccountBalance(userId: string): Promise<AccountBalanceDTO> {
        this.logger.debug(`[UserId: ${userId}] Requested account balance:`);

        const sum = (oldVal: AccountAssetDTO, newVal: AccountAssetDTO) => ({
            ...oldVal,
            amount: oldVal.amount.add(newVal.amount)
        });

        const availableAssetsFromSources = await Promise.all(
            this.assetSources.map((source) => source.availableAssets(userId))
        );

        const available = availableAssetsFromSources.reduce(
            (res, current) => res.mergeWith(sum, current),
            Map<string, AccountAssetDTO>()
        );

        const lockedAssetsFromSources = await Promise.all(
            this.assetSources.map((source) => source.lockedAssets(userId))
        );

        const locked = lockedAssetsFromSources.reduce(
            (res, current) => res.mergeWith(sum, current),
            Map<string, AccountAssetDTO>()
        );

        const balances = new AccountBalanceDTO({
            available: Array.from(available.values()).filter((asset) => asset.amount.gt(new BN(0))),
            locked: Array.from(locked.values())
        });

        this.logger.debug(`[UserId: ${userId}] Balances: ${JSON.stringify(balances)}`);

        return balances;
    }

    public async hasEnoughAssetAmount(userId: string, ...assets: AssetAmount[]): Promise<boolean> {
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

    public async getAssetAmounts(userId: string, assetId: string): Promise<AssetAmount> {
        this.logger.debug(`Checking available amount for user ${userId} asset ${assetId}...`);

        const { available } = await this.getAccountBalance(userId);

        const accountAsset = available.find(({ asset }) => asset.id === assetId);

        this.logger.debug(`Available amount is ${accountAsset?.amount.toString(10) ?? 0}`);

        return {
            id: assetId,
            amount: accountAsset ? accountAsset.amount : new BN(0)
        };
    }
}
