import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BigNumber } from 'ethers';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus } from '@nestjs/common';

import { ApproveCertificationRequestCommand } from '../commands/approve-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificateCreatedEvent } from '../../certificate/events/certificate-created-event';

@CommandHandler(ApproveCertificationRequestCommand)
export class ApproveCertificationRequestHandler
    implements ICommandHandler<ApproveCertificationRequestCommand> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: ApproveCertificationRequestCommand): Promise<ISuccessResponse> {
        const { id } = command;

        const { requestId, isPrivate, energy, approved, owner } = await this.repository.findOne(id);

        if (approved) {
            return ResponseFailure(
                `Certificate #${id} has already been approved`,
                HttpStatus.BAD_REQUEST
            );
        }

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const certReq = await new CertificationRequestFacade(
            requestId,
            blockchainProperties.wrap()
        ).sync();

        let newCertificateId;

        try {
            newCertificateId = await certReq.approve(BigNumber.from(isPrivate ? 0 : energy));
        } catch (e) {
            return ResponseFailure(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.eventBus.publish(
            new CertificateCreatedEvent(newCertificateId, isPrivate ? { owner, energy } : null)
        );

        await this.repository.update(id, {
            approved: true,
            approvedDate: new Date(),
            issuedCertificateTokenId: newCertificateId
        });

        return ResponseSuccess(`Successfully approved certificationRequest ${id}.`);
    }
}
