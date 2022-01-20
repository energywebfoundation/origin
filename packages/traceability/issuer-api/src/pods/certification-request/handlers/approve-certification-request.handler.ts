import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BigNumber } from 'ethers';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus, Logger } from '@nestjs/common';

import { ApproveCertificationRequestCommand } from '../commands/approve-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificatesCreatedEvent } from '../../certificate/events/certificates-created-event';
import { CertificateRequestApprovedEvent } from '../events';

@CommandHandler(ApproveCertificationRequestCommand)
export class ApproveCertificationRequestHandler
    implements ICommandHandler<ApproveCertificationRequestCommand>
{
    private readonly logger = new Logger(ApproveCertificationRequestHandler.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: ApproveCertificationRequestCommand): Promise<ISuccessResponse> {
        const { id } = command;

        const { isPrivate, energy, approved, owner } = await this.repository.findOne(id);

        if (approved) {
            const msg = `Certificate #${id} has already been approved`;
            this.logger.debug(msg);
            return ResponseFailure(msg, HttpStatus.BAD_REQUEST);
        }

        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const certReq = await new CertificationRequestFacade(id, blockchainProperties).sync();

        let newCertificateId;

        if (certReq.approved) {
            this.logger.warn(
                `Certification Request ${certReq.id} is unapproved but should be set to approved. Fixing...`
            );
            newCertificateId = certReq.issuedCertificateTokenId;
        } else {
            try {
                newCertificateId = await certReq.approve(BigNumber.from(isPrivate ? 0 : energy));
            } catch (e) {
                return ResponseFailure(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        await this.repository.update(id, {
            approved: true,
            approvedDate: certReq.approvedDate ?? new Date(),
            issuedCertificateId: newCertificateId
        });

        this.eventBus.publish(
            new CertificatesCreatedEvent([newCertificateId], isPrivate ? { owner, energy } : null)
        );

        this.eventBus.publish(new CertificateRequestApprovedEvent(id));

        return ResponseSuccess(`Successfully approved certificationRequest ${id}.`);
    }
}
