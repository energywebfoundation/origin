import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetCertificationRequestQuery, CertificationRequest } from '@energyweb/issuer-api';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@QueryHandler(GetCertificationRequestQuery)
export class GetCertificationRequestHandler implements IQueryHandler<GetCertificationRequestQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>
    ) {}

    async execute({ id }: GetCertificationRequestQuery): Promise<FullCertificationRequestDTO> {
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: id
        });
        const certificationRequest = await this.repository.findOne(id);
        return {
            ...certificationRequest,
            irecIssueId: irecCertificationRequest?.irecIssueId,
            userId: irecCertificationRequest?.userId
        };
    }
}
