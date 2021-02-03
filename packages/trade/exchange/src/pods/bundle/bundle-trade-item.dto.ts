import { Transform, Expose, Exclude } from 'class-transformer';
import BN from 'bn.js';
import { Asset } from '../asset/asset.entity';

export class BundleTradeItemDTO {
    constructor(asset: Asset, volume: BN) {
        this.asset = asset;
        this.volume = volume;
    }

    @Exclude()
    asset: Asset;

    @Expose()
    get assetId() {
        return this.asset.id;
    }

    @Transform((v: BN) => v.toString(10))
    volume: BN;
}
