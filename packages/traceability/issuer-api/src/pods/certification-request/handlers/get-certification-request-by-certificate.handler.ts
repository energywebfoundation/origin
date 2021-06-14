import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../../certificate';
import { CertificationRequest } from '../certification-request.entity';
import { GetCertificationRequestByCertificateQuery } from '../queries';
import { CertificationRequestDTO } from '../certification-request.dto';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        readonly certificateRepository: Repository<Certificate>
    ) {}

    async execute({
        certificateId
    }: GetCertificationRequestByCertificateQuery): Promise<CertificationRequestDTO> {
        const certificate = await this.certificateRepository.findOne(certificateId);
        return await this.repository.findOne({
            where: {
                issuedCertificateId: certificate.id
            }
        });
    }
}
