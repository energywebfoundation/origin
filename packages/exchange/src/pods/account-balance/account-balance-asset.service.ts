import BN from 'bn.js';
import { Map } from 'immutable';

import { AccountAssetDTO } from '.';
import { Asset } from '../asset';

export interface IAccountableAsset {
    lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>>;
    availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>>;
}

export abstract class AccountBalanceAssetService implements IAccountableAsset {
    abstract async lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>>;

    abstract async availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>>;

    protected sumByAsset<T>(
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
