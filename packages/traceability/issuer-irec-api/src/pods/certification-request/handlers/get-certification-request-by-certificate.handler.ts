import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Certificate,
    GetCertificationRequestByCertificateQuery,
    CertificationRequest
} from '@energyweb/issuer-api';
import { IrecCertificationRequest } from '../irec-certification-request.entity';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>
    ) {}

    async execute({
        certificateId
    }: GetCertificationRequestByCertificateQuery): Promise<FullCertificationRequestDTO> {
        const certificate = await this.certificateRepository.findOne(certificateId);
        const certificationRequest = await this.repository.findOne({
            where: {
                issuedCertificateTokenId: certificate.tokenId
            }
        });
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: certificationRequest.id
        });

        return {
            ...certificationRequest,
            irecIssueId: irecCertificationRequest.irecIssueId,
            userId: irecCertificationRequest.userId
        };
    }
}
