import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProof,
    PreciseProofUtils
} from '@energyweb/issuer';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpStatus, Logger } from '@nestjs/common';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';
import { UnminedCommitment } from '../unmined-commitment.entity';
import {
    CertificateCreatedEvent,
    CertificatePersistedEvent,
    CertificateUpdatedEvent,
    SyncCertificateEvent
} from '../events';

@EventsHandler(CertificateCreatedEvent)
export class CertificateCreatedHandler implements IEventHandler<CertificateCreatedEvent> {
    private readonly logger = new Logger(CertificateCreatedHandler.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        @InjectRepository(UnminedCommitment)
        private readonly unminedCommitmentRepository: Repository<UnminedCommitment>,
        private connection: Connection,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async handle({
        id,
        byTxHash,
        privateInfo
    }: CertificateCreatedEvent): Promise<ISuccessResponse> {
        this.logger.log(`Detected a new certificate with ID ${id}`);

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const existingCertificate = await this.repository.findOne(
            { id },
            { relations: ['blockchain'] }
        );

        if (existingCertificate) {
            // Re-sync the certificate to sync any eventual changes
            this.eventBus.publish(new SyncCertificateEvent(id, byTxHash));

            return ResponseFailure(
                `Certificate with id ${id} already exists in the DB.`,
                HttpStatus.CONFLICT
            );
        }

        let cert;

        try {
            cert = await new CertificateFacade(id, blockchainProperties.wrap()).sync();
        } catch (e) {
            this.logger.error(e.message);
            throw e;
        }

        let latestCommitment: IOwnershipCommitmentProof;

        if (privateInfo) {
            latestCommitment = PreciseProofUtils.generateProofs({
                [privateInfo.owner]: privateInfo.energy
            });
        }

        const txHash = cert.creationTransactionHash.toLowerCase();
        const unminedCommitment = await this.checkCommitment(txHash);

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const certificate = await this.repository.save({
                id: cert.id,
                blockchain: blockchainProperties,
                deviceId: cert.deviceId,
                generationStartTime: cert.generationStartTime,
                generationEndTime: cert.generationEndTime,
                creationTime: cert.creationTime,
                creationTransactionHash: txHash,
                owners: cert.owners,
                issuedPrivately: !!privateInfo || !!unminedCommitment,
                latestCommitment: unminedCommitment ?? latestCommitment
            });

            if (unminedCommitment) {
                await this.unminedCommitmentRepository.delete(txHash);
            }

            this.eventBus.publish(new CertificatePersistedEvent(certificate.id));
            this.eventBus.publish(new CertificateUpdatedEvent(certificate.id, byTxHash));

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();

            this.logger.error(err);
            return ResponseFailure(JSON.stringify(err), HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }

        return ResponseSuccess();
    }

    async checkCommitment(txHash: string): Promise<IOwnershipCommitmentProof | null> {
        const unminedCommitment = await this.unminedCommitmentRepository.findOne(txHash);

        return unminedCommitment?.commitment;
    }
}
