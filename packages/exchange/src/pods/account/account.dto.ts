import { AccountAssetDTO } from './account-asset.dto';

export class AccountDTO {
    public address: string;

    public available: AccountAssetDTO[];

    public locked: AccountAssetDTO[];
}
