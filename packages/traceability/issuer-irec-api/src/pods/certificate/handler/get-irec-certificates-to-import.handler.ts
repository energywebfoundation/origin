import { Repository } from 'typeorm';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { IssueWithStatus } from '@energyweb/issuer-irec-api-wrapper';
import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { GetIrecCertificatesToImportCommand } from '../command';
import { IrecCertificate } from '../irec-certificate.entity';
import { FullCertificationRequestDTO } from '../../certification-request';
import { Inject } from '@nestjs/common';

@CommandHandler(GetIrecCertificatesToImportCommand)
export class GetIrecCertificatesToImportHandler
    implements ICommandHandler<GetIrecCertificatesToImportCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(IrecCertificate)
        private readonly repository: Repository<IrecCertificate>,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({
        user: { id, organizationId }
    }: GetIrecCertificatesToImportCommand): Promise<IssueWithStatus[]> {
        const issues = await this.irecService.getCertificates(id);
        const certificationRequests = await this.queryBus.execute<
            GetAllCertificationRequestsQuery,
            FullCertificationRequestDTO[]
        >(new GetAllCertificationRequestsQuery({ owner: String(organizationId) }));

        return issues.filter((issue) => {
            const certificationRequest = certificationRequests.find(
                (cr) => cr.irecIssueRequestId === issue.code
            );
            return !certificationRequest;
        });
    }
}
