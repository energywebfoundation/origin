/* eslint-disable max-classes-per-file */
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, Validate } from 'class-validator';

export class BundleSplitItemDTO {
    constructor(item: Partial<BundleSplitItemDTO>) {
        Object.assign(this, item);
    }

    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(IntUnitsOfEnergy)
    @Transform((v: BN) => v.toString(10))
    volume: BN;
}

export class BundleSplitVolumeDTO {
    constructor(bundleSplitVolume: Partial<BundleSplitVolumeDTO>) {
        Object.assign(this, bundleSplitVolume);
    }

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(IntUnitsOfEnergy)
    @Transform((v: BN) => v.toString(10))
    volume: BN;

    @ApiProperty({ type: [BundleSplitItemDTO] })
    @IsArray()
    items: BundleSplitItemDTO[];
}

export class BundleSplitDTO {
    constructor(bundleSplits: Partial<BundleSplitDTO>) {
        Object.assign(this, bundleSplits);
    }

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    readonly id: string;

    @ApiProperty({ type: [BundleSplitVolumeDTO] })
    @IsArray()
    readonly splits: BundleSplitVolumeDTO[];
}
