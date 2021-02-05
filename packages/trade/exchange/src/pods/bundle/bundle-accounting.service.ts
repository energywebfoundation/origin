import { Injectable } from '@nestjs/common';
import { Map } from 'immutable';

import { Bundle } from '.';
import { BundleService } from './bundle.service';
import {
    AccountAssetDTO,
    AccountBalanceAssetService,
    AccountBalanceService
} from '../account-balance';

@Injectable()
export class BundleAccountingService extends AccountBalanceAssetService {
    constructor(
        private readonly bundleService: BundleService,
        accountBalanceService: AccountBalanceService
    ) {
        super();
        accountBalanceService.registerAssetSource(this);
    }

    public async lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const bundles = await this.getUserBundles(ownerId);

        return this.getAssetsLockedInBundles(bundles, false);
    }

    public async availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const bundles = await this.getUserBundles(ownerId);

        const inBundlesAvailable = await this.getAssetsLockedInBundles(bundles, true);
        const fromBundles = await this.getAssetsFromBundles(ownerId);

        const sum = (oldVal: AccountAssetDTO, newVal: AccountAssetDTO) => ({
            ...oldVal,
            amount: oldVal.amount.add(newVal.amount)
        });

        return inBundlesAvailable.mergeWith(sum, fromBundles);
    }

    private async getUserBundles(ownerId: string) {
        return this.bundleService.getByUser(ownerId, { isCancelled: false });
    }

    private async getAssetsLockedInBundles(bundles: Bundle[], initialVolume: boolean) {
        const items = bundles.flatMap((bundle) => bundle.items);
        const sign = initialVolume ? -1 : 1;

        return this.sumByAsset(
            items,
            (bundle) => bundle.asset,
            (order) => (initialVolume ? order.startVolume : order.currentVolume).muln(sign)
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
}
