import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';

import {
    BlockchainPropertiesService,
    CertificationRequest,
    CreateCertificationRequestCommand
} from '@energyweb/issuer-api';
import { FileService, UserService } from '@energyweb/origin-backend';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { LoggedInUser } from '@energyweb/origin-backend-core';

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
        const certificationRequest = await this.commandBus.execute(
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
            organizationId: String(params.user.organizationId)
        });
        await this.irecRepository.save(irecCertificationRequest);

        await this.createIrecIssuanceRequest(certificationRequest, params.user);

        return { ...certificationRequest, organizationId: irecCertificationRequest.organizationId };
    }

    async createIrecIssuanceRequest(
        request: CertificationRequest,
        user: LoggedInUser
    ): Promise<void> {
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: request.id
        });

        const platformAdmin = await this.userService.getPlatformAdmin();

        let fileIds: string[] = [];
        if (request.files?.length) {
            const files = await Promise.all(
                request.files.map((fileId) => this.fileService.get(fileId, user))
            );
            fileIds = await this.irecService.uploadFiles(
                user,
                files.map((file) => file.data)
            );
        }

        const irecDevice = await this.deviceService.findOne(request.deviceId);
        const platformTradeAccount = await this.irecService.getTradeAccountCode(platformAdmin.id);
        const irecIssue = await this.irecService.createIssueRequest(platformAdmin.id, {
            device: request.deviceId,
            fuelType: irecDevice.fuelType,
            recipient: platformTradeAccount,
            start: new Date(request.fromTime),
            end: new Date(request.toTime),
            production: Number(request.energy)
        });
        await this.repository.update(request.id, { files: fileIds });
        await this.irecRepository.update(irecCertificationRequest.certificationRequestId, {
            irecIssueRequestId: irecIssue.code
        });
    }
}
