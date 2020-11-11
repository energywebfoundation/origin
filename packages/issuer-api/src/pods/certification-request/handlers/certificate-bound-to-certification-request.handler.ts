import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus } from '@nestjs/common';
import { CertificateBoundToCertificationRequestCommand } from '../commands/certificate-bound-to-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { Certificate } from '../../certificate/certificate.entity';

@CommandHandler(CertificateBoundToCertificationRequestCommand)
export class CertificateBoundToCertificationRequestHandler
    implements ICommandHandler<CertificateBoundToCertificationRequestCommand> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>
    ) {}

    async execute({
        certificateId
    }: CertificateBoundToCertificationRequestCommand): Promise<ISuccessResponse> {
        const certificate = await this.certificateRepository.findOne(certificateId);

        if (!certificate) {
            return ResponseFailure(
                `Unable to find a certificate with ID ${certificateId}`,
                HttpStatus.NOT_FOUND
            );
        }

        const certificationRequest = await this.repository.findOne({
            where: {
                issuedCertificateTokenId: certificate.tokenId
            }
        });

        if (!certificationRequest) {
            return ResponseFailure(
                `Unable to find a certification request for certificate #${certificateId}`,
                HttpStatus.NOT_FOUND
            );
        }

        return ResponseSuccess();
    }
}
