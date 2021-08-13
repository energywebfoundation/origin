import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BigNumber, constants } from 'ethers';
import { IBlockchainEvent } from '@energyweb/issuer';
import { NewTransactionProcessedData } from './events/new-transaction-processed.event';
import { TransactionLog } from './transaction-log.entity';
import { BlockchainEventType } from './types';

interface ISaveParams {
    certificateId: number;
    transactionHash: string;
    transactionType: BlockchainEventType;
}

@Injectable()
export class TransactionLogService {
    private readonly logger = new Logger(TransactionLogService.name);

    constructor(
        @InjectRepository(TransactionLog)
        private readonly repository: Repository<TransactionLog>
    ) {}

    public async logEvent({ event, transactionType }: NewTransactionProcessedData): Promise<void> {
        if (this.shouldSkip(event, transactionType)) {
            return;
        }

        const certificateIds = this.extractEventCertificateIds(event, transactionType);
        const savePromises = certificateIds.map((certificateId) =>
            this.saveTransaction({
                certificateId,
                transactionType,
                transactionHash: event.transactionHash
            })
        );

        await Promise.all(savePromises);
    }

    public async findByCertificateIds(certificateIds: number[]): Promise<TransactionLog[]> {
        return await this.repository.find({
            where: {
                certificateId: In(certificateIds),
            }
        })
    }

    private async saveTransaction({
        certificateId,
        transactionHash,
        transactionType
    }: ISaveParams): Promise<void> {
        const entity = this.repository.create({
            certificateId,
            transactionHash,
            transactionType
        });

        await this.repository.save(entity);
    }

    private extractEventCertificateIds(
        event: IBlockchainEvent,
        eventType: BlockchainEventType
    ): number[] {
        const singleId = event._id ?? event.id; // issue, claim ?? transfer
        const multipleId = event._ids ?? event.ids; // issue, claim ?? transfer

        if (!singleId && !multipleId) {
            this.logger.error(
                `Cannot extract certificates id of ${eventType} for creating transaction log. Probably this event should be ignored`
            );

            return [];
        }

        const ids: BigNumber[] = singleId ? [singleId] : multipleId;

        return ids.map((i) => i.toNumber());
    }

    private shouldSkip(event: IBlockchainEvent, eventType: BlockchainEventType): boolean {
        const isTransfer = [
            BlockchainEventType.TransferBatch,
            BlockchainEventType.TransferSingle
        ].includes(eventType);
        const isSupported = Object.values(BlockchainEventType).includes(eventType);

        return (isTransfer && event.from === constants.AddressZero) || !isSupported;
    }
}
