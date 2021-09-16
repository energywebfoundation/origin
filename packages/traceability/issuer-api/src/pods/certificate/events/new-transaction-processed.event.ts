import { IBlockchainEvent } from '@energyweb/issuer';
import { BlockchainEventType } from '../types';

export interface NewTransactionProcessedData {
    event: IBlockchainEvent;
    transactionType: BlockchainEventType;
}

export class NewTransactionProcessedEvent {
    constructor(public readonly data: NewTransactionProcessedData) {}
}
