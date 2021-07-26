import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { GetIrecCertificatesToImportCommand } from '../command';
import { FullCertificationRequestDTO } from '../../certification-request';
import { IrecAccountItemDto } from '../dto';

@CommandHandler(GetIrecCertificatesToImportCommand)
export class GetIrecCertificatesToImportHandler
    implements ICommandHandler<GetIrecCertificatesToImportCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({ user }: GetIrecCertificatesToImportCommand): Promise<IrecAccountItemDto[]> {
        const irecCertificates = await this.irecService.getCertificates(user);

        const certificationRequests = await this.queryBus.execute<
            GetAllCertificationRequestsQuery,
            FullCertificationRequestDTO[]
        >(new GetAllCertificationRequestsQuery({ deviceIds: [] }));

        return irecCertificates.filter((issue) => {
            return !certificationRequests.some((cr) => issue.asset === cr.irecAssetId);
        });
    }
}
