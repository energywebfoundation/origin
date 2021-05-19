import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, GetCertificationRequestByCertificateQuery } from '@energyweb/issuer-api';
import { CertificationRequest } from '../certification-request.entity';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery>
{
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
        return await this.repository.findOne({
            where: {
                issuedCertificateTokenId: certificate.tokenId
            }
        });
    }
}
