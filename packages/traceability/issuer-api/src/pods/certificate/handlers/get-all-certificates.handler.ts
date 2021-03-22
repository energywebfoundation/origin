import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllCertificatesQuery } from '../queries/get-all-certificates.query';
import { Certificate } from '../certificate.entity';

@QueryHandler(GetAllCertificatesQuery)
export class GetAllCertificatesHandler implements IQueryHandler<GetAllCertificatesQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute(): Promise<Certificate[]> {
        return this.repository.find();
    }
}
