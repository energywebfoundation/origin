import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ type: String })
    @Column()
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @ApiProperty({ type: String })
    @Column()
    @IsNotEmpty()
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Date })
    @Column({ type: 'timestamptz' })
    generationFrom: Date;

    @ApiProperty({ type: Date })
    @Column({ type: 'timestamptz' })
    generationTo: Date;
}
