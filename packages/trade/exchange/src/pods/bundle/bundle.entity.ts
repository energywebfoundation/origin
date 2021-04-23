import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

import { BundleItem } from './bundle-item.entity';
import { BundleSplitItemDTO, BundleSplitVolumeDTO } from './bundle-split.dto';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: `${DB_TABLE_PREFIX}_bundle` })
export class Bundle extends ExtendedBaseEntity {
    constructor(bundle: Partial<Bundle>) {
        super();
        Object.assign(this, bundle);
    }

    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @Column()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ type: Number })
    @Column()
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({ type: Boolean })
    @Column()
    @IsBoolean()
    isCancelled: boolean;

    @ApiProperty({ type: () => [BundleItem] })
    @OneToMany(() => BundleItem, (bundleItem) => bundleItem.bundle, { eager: true, cascade: true })
    items: BundleItem[];

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    @Expose()
    get available() {
        return this.items.reduce((sum: BN, item) => sum.add(item.currentVolume), new BN(0));
    }

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    @Expose()
    get volume() {
        return this.items.reduce((sum: BN, item) => sum.add(item.startVolume), new BN(0));
    }

    canSplit(volume: BN, energyPerUnit: BN): boolean {
        return this.split(volume, energyPerUnit).items.length > 0;
    }

    possibleSplits(energyPerUnit: BN): BundleSplitVolumeDTO[] {
        if (this.available.lt(energyPerUnit)) {
            return [];
        }
        const volume = this.available.div(energyPerUnit).toNumber();
        const splits = [...Array(volume).keys()]
            .map((_, i) => new BN(i + 1).mul(energyPerUnit))
            .map((vol) => this.split(vol, energyPerUnit))
            .filter((split) => split.items.length);
        return splits;
    }

    getUpdatedVolumes(volumeToBuy: BN) {
        return this.items.map((item) => {
            const traded = item.currentVolume.mul(volumeToBuy).div(this.available);

            return {
                id: item.id,
                currentVolume: item.currentVolume.sub(traded)
            };
        });
    }

    private split(volumeToBuy: BN, energyPerUnit: BN): BundleSplitVolumeDTO {
        if (
            !volumeToBuy.mod(energyPerUnit).isZero() ||
            volumeToBuy.lt(energyPerUnit.mul(new BN(this.items.length)))
        ) {
            return new BundleSplitVolumeDTO({ volume: volumeToBuy, items: [] });
        }

        const splits = this.items.map(({ id, currentVolume }) => ({
            id,
            canSplit:
                currentVolume.mul(volumeToBuy).mod(this.available).isZero() &&
                currentVolume.mul(volumeToBuy).div(this.available).mod(energyPerUnit).isZero(),
            volume: currentVolume.mul(volumeToBuy).div(this.available)
        }));

        if (!splits.every((split) => split.canSplit)) {
            return new BundleSplitVolumeDTO({ volume: volumeToBuy, items: [] });
        }

        const items = splits.map(({ id, volume }) => new BundleSplitItemDTO({ id, volume }));

        return new BundleSplitVolumeDTO({ volume: volumeToBuy, items });
    }
}
