import { CreateAssetDTO } from '../asset/asset.entity';

export class CreateDepositDTO {
    public readonly asset: CreateAssetDTO;

    public readonly address: string;

    public readonly transactionHash: string;

    public readonly amount: string;
}
