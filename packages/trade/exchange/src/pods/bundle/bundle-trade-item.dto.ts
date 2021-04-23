import { Transform, Expose, Exclude } from 'class-transformer';
import BN from 'bn.js';
import { Asset } from '../asset/asset.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BundleTradeItemDTO {
    constructor(asset: Asset, volume: BN) {
        this.asset = asset;
        this.volume = volume;
    }

    @Exclude()
    asset: Asset;

    @ApiProperty({ type: Number })
    @Expose()
    get assetId() {
        return this.asset.id;
    }

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    volume: BN;
}
