import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Asset } from '../asset/asset.entity';

@Entity()
export class Deposit extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => Asset)
    asset: Asset;

    @Column('bigint')
    amount: string;

    @Column()
    transactionHash: string;

    @Column()
    status: string;
}