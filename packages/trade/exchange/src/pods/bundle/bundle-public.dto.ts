/* eslint-disable max-classes-per-file */
import BN from 'bn.js';
import { Transform } from 'class-transformer';

import { Asset } from '../asset/asset.entity';
import { Bundle } from './bundle.entity';
import { BundleItem } from './bundle-item.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BundlePublicItemDTO {
    constructor(bundle: Partial<BundleItem>) {
        this.id = bundle.id;
        this.asset = bundle.asset;
        this.startVolume = bundle.startVolume;
        this.currentVolume = bundle.currentVolume;
    }
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: Asset })
    asset: Asset;

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    startVolume: BN;

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    currentVolume: BN;
}

export class BundlePublicDTO {
    constructor(bundle: Bundle) {
        this.id = bundle.id;
        this.items = bundle.items.map((item) => new BundlePublicItemDTO(item));
        this.price = bundle.price;
        this.volume = bundle.volume;
        this.available = bundle.available;
    }

    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: [BundlePublicItemDTO] })
    items: BundlePublicItemDTO[];

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    available: BN;

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    volume: BN;

    @ApiProperty({ type: String })
    price: number;
}
