import { Asset } from './asset.entity';

export class AssetDTO {
    public readonly id?: string;

    public readonly address: string;

    public readonly tokenId: string;

    public readonly deviceId: string;

    public readonly generationFrom: string;

    public readonly generationTo: string;

    public static fromAsset(asset: Asset): AssetDTO {
        return {
            ...asset,
            generationFrom: asset.generationFrom.toISOString(),
            generationTo: asset.generationTo.toISOString()
        };
    }
}
