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

    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @Column()
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ type: String, example: '1' })
    @Column()
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @ApiProperty({ type: String, example: 'Dev1-A' })
    @Column()
    @IsNotEmpty()
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Date, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @Column({ type: 'timestamptz' })
    generationFrom: Date;

    @ApiProperty({ type: Date, example: 'Tue Nov 17 2021 16:09:43 GMT-0500' })
    @Column({ type: 'timestamptz' })
    generationTo: Date;
}
