import { AccountAsset } from './account-asset';

export class Account {
    public userId: string;

    public available: AccountAsset[];

    public locked: AccountAsset[];
}
