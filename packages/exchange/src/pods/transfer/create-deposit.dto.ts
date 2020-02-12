import { AssetDTO } from '../asset/asset.dto';

export class CreateDepositDTO {
    public readonly asset: AssetDTO;

    public readonly address: string;

    public readonly transactionHash: string;

    public readonly amount: string;
}
