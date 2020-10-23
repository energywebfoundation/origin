import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllCertificatesQuery } from '../queries/get-all-certificates.query';
import { Certificate } from '../certificate.entity';
import { ICertificateDTO } from '../certificate.dto';
import { certificateToDto } from '../utils';

@QueryHandler(GetAllCertificatesQuery)
export class GetAllCertificatesHandler implements IQueryHandler<GetAllCertificatesQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ userId }: GetAllCertificatesQuery): Promise<ICertificateDTO[]> {
        const certificates = await this.repository.find();

        return Promise.all(
            certificates.map((certificate) => certificateToDto(certificate, userId))
        );
    }
}
