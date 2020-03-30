import { AccountBalance } from '../account-balance/account-balance';

export class Account {
    public address: string;

    public balances: AccountBalance;

    public constructor(account: Partial<Account>) {
        Object.assign(this, account);
    }
}
