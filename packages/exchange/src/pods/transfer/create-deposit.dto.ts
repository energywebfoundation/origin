import { Asset } from '../asset/asset.entity';

export class CreateDepositDTO {
    public readonly asset: Omit<Asset, 'id'>;

    public readonly address: string;

    public readonly transactionHash: string;

    public readonly amount: string;
}
