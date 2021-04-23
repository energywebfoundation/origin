import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import BN from 'bn.js';
import { Transform, Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

import { BNTransformer } from '../../utils/valueTransformers';
import { Asset } from '../asset/asset.entity';
import { Bundle } from './bundle.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: `${DB_TABLE_PREFIX}_bundle_item` })
export class BundleItem extends ExtendedBaseEntity {
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @ApiProperty({ type: () => Asset })
    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @ApiProperty({ type: String })
    @Column('varchar', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    startVolume: BN;

    @ApiProperty({ type: String })
    @Column('varchar', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    currentVolume: BN;

    @ApiProperty({ type: () => Bundle })
    @ManyToOne(() => Bundle, (bundle) => bundle.items)
    @Exclude()
    bundle: Bundle;
}
