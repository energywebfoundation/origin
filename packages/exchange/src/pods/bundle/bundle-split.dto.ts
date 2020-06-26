/* eslint-disable max-classes-per-file */
import BN from 'bn.js';
import { Transform } from 'class-transformer';

export class BundleSplitItemDTO {
    constructor(item: Partial<BundleSplitItemDTO>) {
        Object.assign(this, item);
    }

    id: string;

    @Transform((v: BN) => v.toString(10))
    volume: BN;
}

export class BundleSplitVolumeDTO {
    constructor(bundleSplitVolume: Partial<BundleSplitVolumeDTO>) {
        Object.assign(this, bundleSplitVolume);
    }

    @Transform((v: BN) => v.toString(10))
    volume: BN;

    items: BundleSplitItemDTO[];
}

export class BundleSplitDTO {
    constructor(bundleSplits: Partial<BundleSplitDTO>) {
        Object.assign(this, bundleSplits);
    }

    readonly id: string;

    readonly splits: BundleSplitVolumeDTO[];
}
