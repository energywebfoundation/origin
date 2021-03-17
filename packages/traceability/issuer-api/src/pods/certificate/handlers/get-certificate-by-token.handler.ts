import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificate.entity';
import { GetCertificateByTokenIdQuery } from '../queries/get-certificate-by-token.query';

@QueryHandler(GetCertificateByTokenIdQuery)
export class GetCertificateByTokenIdHandler implements IQueryHandler<GetCertificateByTokenIdQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ tokenId }: GetCertificateByTokenIdQuery): Promise<Certificate> {
        return this.repository.findOne({ tokenId });
    }
}
