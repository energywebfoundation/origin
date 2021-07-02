import { Repository } from 'typeorm';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { GetAllCertificationRequestsQuery } from '@energyweb/issuer-api';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';

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
        private readonly irecService: IrecService,
        private readonly deviceService: DeviceService
    ) {}

    async execute({
        user: { id, organizationId, ownerId }
    }: GetIrecCertificatesToImportCommand): Promise<IrecAccountItemDto[]> {
        const certificates = await this.irecService.getCertificates(id);
        const irecDevices = await this.deviceService.findAll({ where: { ownerId } });
        const deviceCodes = irecDevices.map((d) => d.code);
        const ownCertificates = certificates.filter((certificate) => {
            return deviceCodes.includes(certificate.device.code);
        });

        const certificateRequests = await this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ owner: ownerId })
        );

        const certificationRequests = await this.queryBus.execute<
            GetAllCertificationRequestsQuery,
            FullCertificationRequestDTO[]
        >(new GetAllCertificationRequestsQuery({ owner: String(organizationId) }));

        return certificates.filter((issue) => {
            const certificationRequest = certificationRequests.find(
                (cr) => cr.irecIssueRequestId === issue.code
            );
            return !certificationRequest;
        });
    }
}
