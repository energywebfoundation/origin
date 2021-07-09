import { Repository } from 'typeorm';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';

import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { GetIrecCertificatesToImportCommand } from '../command';
import { IrecCertificate } from '../irec-certificate.entity';
import { FullCertificationRequestDTO } from '../../certification-request';
import { IrecAccountItemDto } from '../dto';

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
        user: { id, organizationId, ownerId }
    }: GetIrecCertificatesToImportCommand): Promise<IrecAccountItemDto[]> {
        const certificates = await this.irecService.getCertificates(id);

        const certificationRequests = await this.queryBus.execute<
            GetAllCertificationRequestsQuery,
            FullCertificationRequestDTO[]
        >(new GetAllCertificationRequestsQuery({ owner: String(ownerId) }));

        return certificates.filter((issue) => {
            const certificationRequest = certificationRequests.find(
                (cr) => cr.irecIssueRequestId === issue.code
            );
            return !certificationRequest;
        });
    }
}
