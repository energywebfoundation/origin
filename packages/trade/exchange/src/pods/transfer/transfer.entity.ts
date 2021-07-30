import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Asset } from '../asset/asset.entity';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: `${DB_TABLE_PREFIX}_transfer` })
@Unique(['direction', 'transactionHash'])
export class Transfer extends ExtendedBaseEntity {
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    userId: string;

    @ApiProperty({ type: () => Asset })
    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @ApiProperty({ type: String })
    @Column('bigint')
    amount: string;

    @ApiProperty({ type: String })
    @Column({ nullable: true })
    transactionHash: string;

    @ApiProperty({ type: String })
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
