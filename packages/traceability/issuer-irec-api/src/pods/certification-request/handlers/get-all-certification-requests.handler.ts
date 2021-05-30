import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
    CertificationRequest,
    GetAllCertificationRequestsQuery,
    GetAllCertificationRequestsHandler as OriginalHandler
} from '@energyweb/issuer-api';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@QueryHandler(GetAllCertificationRequestsQuery)
export class GetAllCertificationRequestsHandler
    extends OriginalHandler
    implements IQueryHandler<GetAllCertificationRequestsQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        @InjectRepository(IrecCertificationRequest)
        readonly irecRepository: Repository<IrecCertificationRequest>
    ) {
        super(repository);
    }

    async execute({
        query
    }: GetAllCertificationRequestsQuery): Promise<FullCertificationRequestDTO[]> {
        const certificationRequests = await super.execute({ query });
        const irecCertificationRequests = await this.irecRepository.find({
            certificationRequestId: In(certificationRequests.map((c) => c.id))
        });

        return certificationRequests.map((certificationRequest) => {
            const irecCertificationRequest = irecCertificationRequests.find(
                (cr) => cr.certificationRequestId === certificationRequest.id
            );
            return {
                ...certificationRequest,
                irecIssueId: irecCertificationRequest?.irecIssueId,
                userId: irecCertificationRequest?.userId
            };
        });
    }
}
