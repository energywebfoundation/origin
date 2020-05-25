import { ExtendedBaseEntity } from '@energyweb/origin-backend';
import BN from 'bn.js';
import { Transform, Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BundleItem } from './bundle-item.entity';

@Entity()
export class Bundle extends ExtendedBaseEntity {
    constructor(bundle: Partial<Bundle>) {
        super();
        Object.assign(this, bundle);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Expose()
    userId: string;

    @Column()
    price: number;

    @OneToMany(() => BundleItem, (bundleItem) => bundleItem.bundle, { eager: true, cascade: true })
    items: BundleItem[];

    @Transform((v: BN) => v.toString(10))
    @Expose()
    get available() {
        return this.items.reduce((sum: BN, item) => sum.add(item.currentVolume), new BN(0));
    }

    @Transform((v: BN) => v.toString(10))
    @Expose()
    get volume() {
        return this.items.reduce((sum: BN, item) => sum.add(item.startVolume), new BN(0));
    }

    canSplit(volume: BN, energyPerUnit: BN) {
        if (!volume.mod(energyPerUnit).isZero()) {
            return false;
        }

        const precision = new BN(1000);
        const ratio = volume.mul(precision).div(volume);

        return this.items.every((item) => item.currentVolume.mul(precision).mod(ratio).isZero());
    }
}
