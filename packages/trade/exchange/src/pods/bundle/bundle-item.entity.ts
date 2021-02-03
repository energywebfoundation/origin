import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import BN from 'bn.js';
import { Transform, Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

import { BNTransformer } from '../../utils/valueTransformers';
import { Asset } from '../asset/asset.entity';
import { Bundle } from './bundle.entity';

@Entity({ name: `${DB_TABLE_PREFIX}_bundle_item` })
export class BundleItem extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @Column('varchar', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    startVolume: BN;

    @Column('varchar', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    currentVolume: BN;

    @ManyToOne(() => Bundle, (bundle) => bundle.items)
    @Exclude()
    bundle: Bundle;
}
