import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BlockchainEventType } from './types';

export const TRANSACTION_LOG_TABLE_NAME = 'transaction_log';

@Entity({ name: TRANSACTION_LOG_TABLE_NAME })
export class TransactionLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int4' })
    certificateId: number;

    @Column({ type: 'text' })
    transactionHash: string;

    @Column({ type: 'text' })
    transactionType: BlockchainEventType;

    @Column({ type: 'timestamptz' })
    transactionTimestamp: Date;
}
