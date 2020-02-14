import { AccountAsset } from './account-asset';

export class AccountBalance {
    public readonly available: AccountAsset[];

    public readonly locked: AccountAsset[];
}
