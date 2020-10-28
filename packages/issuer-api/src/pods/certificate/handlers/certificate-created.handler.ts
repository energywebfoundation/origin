import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProof,
    PreciseProofUtils
} from '@energyweb/issuer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate.entity';

@EventsHandler(CertificateCreatedEvent)
export class CertificateCreatedHandler implements IEventHandler<CertificateCreatedEvent> {
    private readonly logger = new Logger(CertificateCreatedHandler.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async handle({
        certificateId,
        privateInfo
    }: CertificateCreatedEvent): Promise<ISuccessResponse> {
        this.logger.log(`Detected a new certificate with ID ${certificateId}`);

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const existingCertificate = await this.repository.findOne(
            { tokenId: certificateId },
            { relations: ['blockchain'] }
        );

        if (existingCertificate) {
            return ResponseFailure(
                `Certificate with tokenId ${certificateId} already exists in the DB.`
            );
        }

        const cert = await new CertificateFacade(certificateId, blockchainProperties.wrap()).sync();

        let latestCommitment: IOwnershipCommitmentProof;

        if (privateInfo) {
            latestCommitment = PreciseProofUtils.generateProofs({
                [privateInfo.owner]: privateInfo.energy
            });
        }

        const certificate = this.repository.create({
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

        await this.repository.save(certificate);

        return ResponseSuccess();
    }
}
