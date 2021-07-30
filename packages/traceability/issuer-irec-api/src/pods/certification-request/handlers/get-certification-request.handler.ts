import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    GetCertificationRequestQuery,
    CertificationRequest,
    GetCertificationRequestHandler as OriginalHandler
} from '@energyweb/issuer-api';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@QueryHandler(GetCertificationRequestQuery)
export class GetCertificationRequestHandler
    extends OriginalHandler
    implements IQueryHandler<GetCertificationRequestQuery>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        @InjectRepository(IrecCertificationRequest)
        readonly irecRepository: Repository<IrecCertificationRequest>
    ) {
        super(repository);
    }

    async execute({ id }: GetCertificationRequestQuery): Promise<FullCertificationRequestDTO> {
        const certificationRequest = await super.execute({ id });
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: id
        });

        return {
            ...certificationRequest,
            irecIssueRequestId: irecCertificationRequest?.irecIssueRequestId,
            organizationId: irecCertificationRequest?.organizationId
        };
    }
}
