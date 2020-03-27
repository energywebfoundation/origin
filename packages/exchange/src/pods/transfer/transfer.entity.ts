import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Asset } from '../asset/asset.entity';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

@Entity()
export class Transfer extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @Column('bigint')
    amount: string;

    @Column({ nullable: true })
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
