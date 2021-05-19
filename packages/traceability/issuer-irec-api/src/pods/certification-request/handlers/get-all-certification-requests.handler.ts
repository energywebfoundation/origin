import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { CertificationRequest } from '../certification-request.entity';

@QueryHandler(GetAllCertificationRequestsQuery)
export class GetAllCertificationRequestsHandler
    implements IQueryHandler<GetAllCertificationRequestsQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({ query }: GetAllCertificationRequestsQuery): Promise<CertificationRequest[]> {
        return this.repository.find(query);
    }
}
