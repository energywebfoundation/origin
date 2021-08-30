import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Certificate,
    CertificationRequest,
    GetCertificationRequestByCertificateQuery,
    GetCertificationRequestByCertificateHandler as OriginalHandler
} from '@energyweb/issuer-api';
import { IrecCertificationRequest } from '../irec-certification-request.entity';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    extends OriginalHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        readonly certificateRepository: Repository<Certificate>,
        @InjectRepository(IrecCertificationRequest)
        readonly irecRepository: Repository<IrecCertificationRequest>
    ) {
        super(repository, certificateRepository);
    }

    async execute({
        certificateId
    }: GetCertificationRequestByCertificateQuery): Promise<FullCertificationRequestDTO> {
        const certificationRequest = await super.execute({
            certificateId
        });
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: certificationRequest.id
        });

        return {
            ...certificationRequest,
            irecIssueRequestId: irecCertificationRequest.irecIssueRequestId,
            organizationId: irecCertificationRequest.organizationId
        };
    }
}
