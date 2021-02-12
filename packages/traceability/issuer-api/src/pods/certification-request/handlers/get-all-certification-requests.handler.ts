import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllCertificationRequestsQuery } from '../queries/get-all-certification-requests.query';
import { CertificationRequest } from '../certification-request.entity';

@QueryHandler(GetAllCertificationRequestsQuery)
export class GetAllCertificationRequestsHandler
    implements IQueryHandler<GetAllCertificationRequestsQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async execute(): Promise<CertificationRequest[]> {
        return this.repository.find();
    }
}
