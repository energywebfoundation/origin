import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Asset } from '../asset/asset.entity';
import { TransferDirection } from './transfer-direction';

@Entity()
export class Transfer extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @Column('bigint')
    amount: string;

    @Column()
    transactionHash: string;

    @Column()
    address: string;

    @Column()
    confirmed: boolean;

    @Column({ nullable: true })
    confirmationBlock?: number;

    @Column()
    direction: TransferDirection;
}
