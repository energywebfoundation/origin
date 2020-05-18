import { Type } from 'class-transformer';

import { AccountAsset } from './account-asset';

export class AccountBalance {
    @Type(() => AccountAsset)
    public readonly available: AccountAsset[];

    @Type(() => AccountAsset)
    public readonly locked: AccountAsset[];

    public constructor(accountBalance: Partial<AccountBalance>) {
        Object.assign(this, accountBalance);
    }
}
