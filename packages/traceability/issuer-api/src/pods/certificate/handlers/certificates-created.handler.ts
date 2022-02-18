import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProof,
    PreciseProofUtils,
    CertificateSchemaVersion
} from '@energyweb/issuer';
import { Connection, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';
import { UnminedCommitment } from '../unmined-commitment.entity';
import {
    CertificatesCreatedEvent,
    CertificatePersistedEvent,
    CertificateUpdatedEvent,
    SyncCertificateEvent
} from '../events';

@EventsHandler(CertificatesCreatedEvent)
export class CertificatesCreatedHandler implements IEventHandler<CertificatesCreatedEvent> {
    private readonly logger = new Logger(CertificatesCreatedHandler.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        @InjectRepository(UnminedCommitment)
        private readonly unminedCommitmentRepository: Repository<UnminedCommitment>,
        private connection: Connection,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async handle({ ids, privateInfo }: CertificatesCreatedEvent): Promise<void> {
        ids.forEach((id) => this.logger.log(`Detected a new certificate with ID ${id}`));

        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const existingCertificates = await this.repository.find({
            where: {
                id: In(ids)
            },
            relations: ['blockchain']
        });

        const notExistingCertificates = ids.filter(
            (id) => !existingCertificates.some((c) => c.id === id)
        );

        existingCertificates.forEach((c) => {
            // Re-sync the certificate to sync any eventual changes
            this.eventBus.publish(new SyncCertificateEvent(c.id));
        });

        if (notExistingCertificates.length === 0) {
            return;
        }

        const newCertificates = await Promise.all(
            notExistingCertificates.map(async (id) => {
                try {
                    return await new CertificateFacade(
                        id,
                        blockchainProperties,
                        CertificateSchemaVersion.Latest
                    ).sync();
                } catch (e) {
                    this.logger.error(e.message);
                    throw e;
                }
            })
        );

        let latestCommitment: IOwnershipCommitmentProof;

        if (privateInfo) {
            latestCommitment = PreciseProofUtils.generateProofs({
                [privateInfo.owner]: privateInfo.energy
            });
        }

        const txHash = newCertificates[0].creationTransactionHash;
        const unminedCommitment = await this.checkCommitment(txHash);
        const blockchainPropertiesEntity = await this.blockchainPropertiesService.get();

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const certificateEntities = newCertificates.map((cert) =>
                this.repository.create({
                    id: cert.id,
                    blockchain: blockchainPropertiesEntity,
                    deviceId: cert.deviceId,
                    generationStartTime: cert.generationStartTime,
                    generationEndTime: cert.generationEndTime,
                    creationTime: cert.creationTime,
                    creationTransactionHash: txHash,
                    owners: cert.owners,
                    issuedPrivately: !!privateInfo || !!unminedCommitment,
                    latestCommitment: unminedCommitment ?? latestCommitment,
                    metadata: cert.metadata,
                    schemaVersion: cert.schemaVersion
                })
            );

            await queryRunner.manager.save(certificateEntities);

            if (unminedCommitment) {
                await queryRunner.manager.delete(UnminedCommitment, { txHash });
            }

            await queryRunner.commitTransaction();

            newCertificates.forEach((certificate) => {
                this.eventBus.publish(new CertificatePersistedEvent(certificate.id));
                this.eventBus.publish(new CertificateUpdatedEvent(certificate.id, txHash));
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();

            this.logger.error(err);
        } finally {
            await queryRunner.release();
        }
    }

    async checkCommitment(txHash: string): Promise<IOwnershipCommitmentProof | null> {
        const unminedCommitment = await this.unminedCommitmentRepository.findOne(txHash);

        return unminedCommitment?.commitment;
    }
}
