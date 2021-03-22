import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProof,
    PreciseProofUtils
} from '@energyweb/issuer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus, Logger } from '@nestjs/common';
import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';
import { CertificatePersistedEvent } from '../events/certificate-persisted.event';

@EventsHandler(CertificateCreatedEvent)
export class CertificateCreatedHandler implements IEventHandler<CertificateCreatedEvent> {
    private readonly logger = new Logger(CertificateCreatedHandler.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async handle({ tokenId, privateInfo }: CertificateCreatedEvent): Promise<ISuccessResponse> {
        this.logger.log(`Detected a new certificate with ID ${tokenId}`);

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const existingCertificate = await this.repository.findOne(
            { tokenId },
            { relations: ['blockchain'] }
        );

        if (existingCertificate) {
            return ResponseFailure(
                `Certificate with tokenId ${tokenId} already exists in the DB.`,
                HttpStatus.CONFLICT
            );
        }

        const cert = await new CertificateFacade(tokenId, blockchainProperties.wrap()).sync();

        let latestCommitment: IOwnershipCommitmentProof;

        if (privateInfo) {
            latestCommitment = PreciseProofUtils.generateProofs({
                [privateInfo.owner]: privateInfo.energy
            });
        }

        const certificate = await this.repository.save({
            blockchain: blockchainProperties,
            tokenId: cert.id,
            deviceId: cert.deviceId,
            generationStartTime: cert.generationStartTime,
            generationEndTime: cert.generationEndTime,
            creationTime: cert.creationTime,
            creationBlockHash: cert.creationBlockHash,
            owners: cert.owners,
            issuedPrivately: !!privateInfo,
            latestCommitment
        });

        this.eventBus.publish(new CertificatePersistedEvent(certificate.id));

        return ResponseSuccess();
    }
}
