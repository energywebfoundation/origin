import { Asset } from '../asset/asset.entity';

export type AccountDTO = {
    address: string;
    balances: AccountBalanceDTO;
};

export type AccountBalanceDTO = {
    available: AccountAssetDTO[];
    locked: AccountAssetDTO[];
};

export type AccountAssetDTO = {
    asset: Asset;
    amount: string;
};
