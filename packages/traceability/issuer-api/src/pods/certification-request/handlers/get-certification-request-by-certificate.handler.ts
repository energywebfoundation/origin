import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../../certificate/certificate.entity';
import { CertificationRequest } from '../certification-request.entity';
import { GetCertificationRequestByCertificateQuery } from '../queries/get-certification-request-by-certificate.query';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>
    ) {}

    async execute({
        certificateId
    }: GetCertificationRequestByCertificateQuery): Promise<CertificationRequest> {
        const certificate = await this.certificateRepository.findOne(certificateId);
        const certificationRequest = await this.repository.findOne({
            where: {
                issuedCertificateTokenId: certificate.tokenId
            }
        });

        return certificationRequest;
    }
}
