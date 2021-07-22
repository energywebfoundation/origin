import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { GetAllCertificationRequestsQuery } from '../queries';
import { CertificationRequest } from '../certification-request.entity';
import { CertificationRequestDTO } from '../certification-request.dto';

@QueryHandler(GetAllCertificationRequestsQuery)
export class GetAllCertificationRequestsHandler
    implements IQueryHandler<GetAllCertificationRequestsQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({ query }: GetAllCertificationRequestsQuery): Promise<CertificationRequestDTO[]> {
        const q = query || {};
        return this.repository.find({
            ...(q.hasOwnProperty('approved') ? { approved: q.approved } : {}),
            ...(q.owner ? { owner: q.owner } : {}),
            ...(q.deviceIds?.length ? { deviceId: In(q.deviceIds) } : {})
        });
    }
}
