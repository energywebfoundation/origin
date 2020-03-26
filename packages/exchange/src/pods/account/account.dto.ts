/* eslint-disable max-classes-per-file */
import { Account } from './account';
import { AssetDTO } from '../asset/asset.dto';

export class AccountDTO {
    address: string;

    balances: AccountBalanceDTO;

    public static fromAccount(account: Account): AccountDTO {
        return {
            ...account,
            balances: {
                available: account.balances.available.map(b => ({
                    asset: AssetDTO.fromAsset(b.asset),
                    amount: b.amount.toString(10)
                })),
                locked: account.balances.locked.map(b => ({
                    asset: AssetDTO.fromAsset(b.asset),
                    amount: b.amount.toString(10)
                }))
            }
        };
    }
}

export class AccountBalanceDTO {
    available: AccountAssetDTO[];

    locked: AccountAssetDTO[];
}

export class AccountAssetDTO {
    asset: AssetDTO;

    amount: string;
}
