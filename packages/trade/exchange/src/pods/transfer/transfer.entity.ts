import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Asset } from '../asset/asset.entity';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_transfer` })
export class Transfer extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @Column('bigint')
    amount: string;

    @Column({ nullable: true, unique: true })
    transactionHash: string;

    @Column()
    address: string;

    @Column()
    status: TransferStatus;

    @Column({ nullable: true })
    confirmationBlock?: number;

    @Column()
    direction: TransferDirection;
}
