/* eslint-disable max-classes-per-file */
import { Asset } from '../asset/asset.entity';
import { Account } from './account';

export class AccountDTO {
    address: string;

    balances: AccountBalanceDTO;

    public static fromAccount(account: Account): AccountDTO {
        return {
            ...account,
            balances: {
                available: account.balances.available.map(b => ({
                    ...b,
                    amount: b.amount.toString(10)
                })),
                locked: account.balances.locked.map(b => ({ ...b, amount: b.amount.toString(10) }))
            }
        };
    }
}

export class AccountBalanceDTO {
    available: AccountAssetDTO[];

    locked: AccountAssetDTO[];
}

export class AccountAssetDTO {
    asset: Asset;

    amount: string;
}
