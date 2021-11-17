import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Asset } from '../asset/asset.entity';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_transfer` })
@Unique(['direction', 'transactionHash'])
export class Transfer extends ExtendedBaseEntity {
    @ApiProperty({ type: String, description: "UUID string identifier", example: "123e4567-e89b-12d3-a456-426614174000" })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    userId: string;

    @ApiProperty({ type: () => Asset })
    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @ApiProperty({ type: String, example: "500"  })
    @Column('bigint')
    amount: string;

    @ApiProperty({ type: String })
    @Column({ nullable: true })
    transactionHash: string;

    @ApiProperty({ type: String, description: "Public blockchain address", example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8' })
    @Column()
    address: string;

    @ApiProperty({ enum: TransferStatus, enumName: 'TransferStatus' })
    @Column()
    status: TransferStatus;

    @ApiProperty({ type: Number })
    @Column({ nullable: true })
    confirmationBlock?: number;

    @ApiProperty({ enum: TransferDirection, enumName: 'TransferDirection' })
    @Column()
    direction: TransferDirection;
}
