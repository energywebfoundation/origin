import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, Inject } from '@nestjs/common';

import {
    BlockchainPropertiesService,
    CertificationRequest,
    CreateCertificationRequestCommand
} from '@energyweb/issuer-api';
import { FileService, UserService } from '@energyweb/origin-backend';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';

import { CreateIrecCertificationRequestCommand } from '../commands';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@CommandHandler(CreateIrecCertificationRequestCommand)
export class CreateIrecCertificationRequestHandler
    implements ICommandHandler<CreateIrecCertificationRequestCommand>
{
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,

        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>,
        private readonly eventBus: EventBus,
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly userService: UserService,
        private readonly fileService: FileService,
        private readonly deviceService: DeviceService
    ) {}

    async execute(
        params: CreateIrecCertificationRequestCommand
    ): Promise<FullCertificationRequestDTO> {
        const { user, files, deviceId } = params;

        const irecDevice = await this.deviceService.findOne(deviceId);
        if (!irecDevice || irecDevice.status !== DeviceState.Approved) {
            throw new ForbiddenException('IREC Device is not approved');
        }

        const platformAdmin = await this.userService.getPlatformAdmin();

        let fileIds: string[] = [];
        if (files?.length) {
            const list = await Promise.all(
                files.map((fileId) => this.fileService.get(fileId, user))
            );
            fileIds = await this.irecService.uploadFiles(
                user.organizationId,
                list.map((file) => file.data)
            );
        }

        const platformTradeAccount = await this.irecService.getTradeAccountCode(
            platformAdmin.organization.id
        );
        const irecIssue = await this.irecService.createIssueRequest(platformAdmin.organization.id, {
            device: irecDevice.code,
            fuelType: irecDevice.fuelType,
            recipient: platformTradeAccount,
            start: new Date(params.fromTime * 1e3),
            end: new Date(params.toTime * 1e3),
            production: Number(params.energy) / 1e6,
            files: fileIds
        });

        const certificationRequest: CertificationRequest = await this.commandBus.execute(
            new CreateCertificationRequestCommand(
                params.to,
                params.energy,
                params.fromTime,
                params.toTime,
                params.deviceId,
                params.files,
                params.isPrivate
            )
        );

        const irecCertificationRequest = this.irecRepository.create({
            certificationRequestId: certificationRequest.id,
            organizationId: String(user.organizationId),
            irecIssueRequestId: irecIssue.code
        });
        await this.irecRepository.save(irecCertificationRequest);

        return { ...certificationRequest, organizationId: irecCertificationRequest.organizationId };
    }
}
