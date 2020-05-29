import { Type } from 'class-transformer';

import { AccountBalance } from '../account-balance/account-balance';

export class AccountDTO {
    public address: string;

    @Type(() => AccountBalance)
    public balances: AccountBalance;

    public constructor(account: Partial<AccountDTO>) {
        Object.assign(this, account);
    }
}
