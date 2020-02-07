import { AccountAsset } from './account-asset';

export class Account {
    public address: string;

    public available: AccountAsset[];

    public locked: AccountAsset[];
}
