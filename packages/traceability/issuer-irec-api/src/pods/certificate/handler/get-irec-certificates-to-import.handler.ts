import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { GetIrecCertificatesToImportCommand } from '../command';
import { FullCertificationRequestDTO } from '../../certification-request';
import { IrecAccountItemDto } from '../dto';
import { DeviceRegistryService } from '@energyweb/origin-device-registry-api';

@CommandHandler(GetIrecCertificatesToImportCommand)
export class GetIrecCertificatesToImportHandler
    implements ICommandHandler<GetIrecCertificatesToImportCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly deviceRegistryService: DeviceRegistryService
    ) {}

    async execute({ user }: GetIrecCertificatesToImportCommand): Promise<IrecAccountItemDto[]> {
        const irecCertificates = await this.irecService.getCertificates(user);
        const devices = await this.deviceRegistryService.find({ where: { owner: user.ownerId } });

        const certificationRequests = await this.queryBus.execute<
            GetAllCertificationRequestsQuery,
            FullCertificationRequestDTO[]
        >(new GetAllCertificationRequestsQuery({ deviceIds: devices.map((d) => d.id) }));

        return irecCertificates.filter((issue) => {
            return !certificationRequests.some((cr) => issue.asset === cr.irecAssetId);
        });
    }
}
