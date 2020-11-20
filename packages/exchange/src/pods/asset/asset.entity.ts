import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

import { IsNotEmpty, IsString } from 'class-validator';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

export interface IAsset {
    id: string;
    address: string;
    tokenId: string;
    deviceId: string;
    generationFrom: Date;
    generationTo: Date;
}

@Entity({ name: `${DB_TABLE_PREFIX}_asset` })
export class Asset extends ExtendedBaseEntity implements IAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    address: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    deviceId: string;

    @Column({ type: 'timestamptz' })
    generationFrom: Date;

    @Column({ type: 'timestamptz' })
    generationTo: Date;
}
