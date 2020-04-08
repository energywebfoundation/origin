import { AccountAsset } from './account-asset';

export class AccountBalance {
    public readonly available: AccountAsset[];

    public readonly locked: AccountAsset[];

    public constructor(accountBalance: Partial<AccountBalance>) {
        Object.assign(this, accountBalance);
    }
}
