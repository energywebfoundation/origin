import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CertificationRequest } from '../certification-request.entity';
import { GetCertificationRequestByCertificateQuery } from '../queries';
import { CertificationRequestDTO } from '../certification-request.dto';

@QueryHandler(GetCertificationRequestByCertificateQuery)
export class GetCertificationRequestByCertificateHandler
    implements IQueryHandler<GetCertificationRequestByCertificateQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({
        certificateId
    }: GetCertificationRequestByCertificateQuery): Promise<CertificationRequestDTO> {
        return await this.repository.findOne({
            where: {
                issuedCertificateId: certificateId
            }
        });
    }
}
