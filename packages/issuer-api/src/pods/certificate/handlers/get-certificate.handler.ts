import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateDTO } from '../certificate.dto';
import { Certificate } from '../certificate.entity';
import { GetCertificateQuery } from '../queries/get-certificate.query';
import { certificateToDto } from '../utils';

@QueryHandler(GetCertificateQuery)
export class GetCertificateHandler implements IQueryHandler<GetCertificateQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ id, userId }: GetCertificateQuery): Promise<CertificateDTO> {
        const certificate = await this.repository.findOne(id);

        return certificateToDto(certificate, userId);
    }
}
