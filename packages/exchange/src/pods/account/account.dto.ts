import { AccountBalance } from '../account-balance/account-balance';

export class AccountDTO {
    public address: string;

    public balances: AccountBalance;

    public constructor(account: Partial<AccountDTO>) {
        Object.assign(this, account);
    }
}
