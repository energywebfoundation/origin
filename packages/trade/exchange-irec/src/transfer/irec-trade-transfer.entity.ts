import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface IIrecTradeTransfer {
    id: number;
    tokenId: string;
    verificationKey: string;
    createdAt: Date;
    updatedAt: Date;
}

@Entity({ name: `irec_trade_transfer` })
export class IrecTradeTransfer extends ExtendedBaseEntity implements IIrecTradeTransfer {
    @ApiProperty({ type: Number })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ type: String, example: '1' })
    @Column()
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @ApiProperty({ type: String, example: 'S4ELosCw' })
    @Column()
    @IsNotEmpty()
    @IsString()
    verificationKey: string;
}
