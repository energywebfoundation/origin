import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BlockchainEventType } from './types';
import { Min } from 'class-validator';

export const TRANSACTION_LOG_TABLE_NAME = 'transaction_log';

@Entity({ name: TRANSACTION_LOG_TABLE_NAME })
export class TransactionLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'bigint' })
    @Min(1)
    certificateId: number;

    @Column({ type: 'text' })
    transactionHash: string;

    @Column({ type: 'text' })
    transactionType: BlockchainEventType;

    @Column({ type: 'timestamptz' })
    transactionTimestamp: Date;
}
