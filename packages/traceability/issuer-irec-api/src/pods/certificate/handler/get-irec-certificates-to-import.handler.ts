import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetIrecCertificatesToImportCommand } from '../command/get-irec-certificates-to-import.command';
import { IrecCertificate } from '../irec-certificate.entity';
import { IssueWithStatus } from '@energyweb/issuer-irec-api-wrapper';
import { IrecService } from '../../irec';
import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { FullCertificationRequestDTO } from '../../certification-request';

@CommandHandler(GetIrecCertificatesToImportCommand)
export class GetIrecCertificatesToImportHandler
    implements ICommandHandler<GetIrecCertificatesToImportCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(IrecCertificate)
        private readonly repository: Repository<IrecCertificate>,
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
