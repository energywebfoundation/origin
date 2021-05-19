import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCertificationRequestQuery } from '@energyweb/issuer-api';
import { CertificationRequest } from '../certification-request.entity';

@QueryHandler(GetCertificationRequestQuery)
export class GetCertificationRequestHandler implements IQueryHandler<GetCertificationRequestQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({ id }: GetCertificationRequestQuery): Promise<CertificationRequest> {
        return this.repository.findOne(id);
    }
}
