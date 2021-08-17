import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BigNumber, constants } from 'ethers';
import { IBlockchainEvent } from '@energyweb/issuer';
import { NewTransactionProcessedData } from './events/new-transaction-processed.event';
import { TransactionLog } from './transaction-log.entity';
import { BlockchainEventType } from './types';
import { groupBy, partition } from '../../utils/array';

interface ISaveParams {
    certificateId: number;
    transactionHash: string;
    transactionType: BlockchainEventType;
    transactionTimestamp: Date;
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
                transactionHash: event.transactionHash,
                transactionTimestamp: event.timestamp
                    ? new Date(event.timestamp * 1000)
                    : new Date()
            })
        );

        await Promise.all(savePromises);
    }

    public async findByCertificateIds(certificateIds: number[]): Promise<TransactionLog[]> {
        const logs = await this.repository.find({
            where: {
                certificateId: In(certificateIds)
            }
        });

        return this.removeDuplicatedLogs(logs);
    }

    private async saveTransaction({
        certificateId,
        transactionHash,
        transactionType,
        transactionTimestamp
    }: ISaveParams): Promise<void> {
        const entity = this.repository.create({
            certificateId,
            transactionHash,
            transactionType,
            transactionTimestamp
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
        const isTransfer = this.isTransfer(eventType);
        const isSupported = Object.values(BlockchainEventType).includes(eventType);

        return (
            (isTransfer && event.from === constants.AddressZero) ||
            (isTransfer && event.to === constants.AddressZero) ||
            !isSupported
        );
    }

    /**
     * @INFO
     *
     * For batch claim and transfer we use `ClaimBatchMultiple` and `TransferBatchMultiple` events.
     * Besides these events we receive also TransferSingle events. This is expected at this point,
     * we don't want to modify smart contract. Normally they would not be emitted.
     *
     * If at any point it becomes a problem, that there are too many events stored,
     * you can use script below to implement some sort of cleaner for database.
     *
     * 18.08.2021
     */
    private removeDuplicatedLogs(logs: TransactionLog[]): TransactionLog[] {
        const [suspiciousLogs, otherLogs] = partition(logs, (l) => {
            return this.isTransfer(l.transactionType) || this.isClaim(l.transactionType);
        });

        const grouped = Object.values(
            groupBy(
                suspiciousLogs,
                (log) => `${log.transactionHash}--${log.certificateId}` as string
            )
        );
        const filtered = grouped.map((group) => {
            if (group.some((l) => this.isMultiple(l.transactionType))) {
                return group.filter(
                    (g) => g.transactionType !== BlockchainEventType.TransferSingle
                );
            } else {
                return group;
            }
        });

        return [...otherLogs, ...filtered.flat()];
    }

    private isMultiple(type: BlockchainEventType): boolean {
        return [
            BlockchainEventType.TransferBatchMultiple,
            BlockchainEventType.ClaimBatchMultiple
        ].includes(type);
    }

    private isTransfer(type: BlockchainEventType): boolean {
        return [
            BlockchainEventType.TransferBatch,
            BlockchainEventType.TransferBatchMultiple,
            BlockchainEventType.TransferSingle
        ].includes(type);
    }

    private isClaim(type: BlockchainEventType): boolean {
        return [
            BlockchainEventType.ClaimBatch,
            BlockchainEventType.ClaimSingle,
            BlockchainEventType.ClaimBatchMultiple
        ].includes(type);
    }
}
