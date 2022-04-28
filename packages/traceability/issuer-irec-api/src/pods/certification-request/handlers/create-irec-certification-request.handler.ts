import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CertificationRequest, CreateCertificationRequestCommand } from '@energyweb/issuer-api';
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
        @InjectRepository(IrecCertificationRequest)
        private readonly irecRepository: Repository<IrecCertificationRequest>,
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
        const { user, dto } = params;

        const irecDevice = await this.deviceService.findOne(dto.deviceId);
        if (!irecDevice || irecDevice.status !== DeviceState.Approved) {
            throw new ForbiddenException('IREC Device is not approved');
        }

        const platformAdmin = await this.userService.getPlatformAdmin();

        let fileIds: string[] = [];
        if (dto.files?.length) {
            const list = await Promise.all(
                dto.files.map((fileId) => this.fileService.get(fileId, user))
            );
            fileIds = await this.irecService.uploadFiles(
                user.organizationId,
                list.map((file) => ({ data: file.data, filename: file.filename }))
            );
        }

        const tradeAccount =
            dto.irecTradeAccountCode ||
            (await this.irecService.getTradeAccountCode(platformAdmin.organization.id));

        const irecIssue = await this.irecService.createIssueRequest(irecDevice.ownerId, {
            device: irecDevice.code,
            fuelType: irecDevice.fuelType,
            recipient: tradeAccount,
            start: new Date(dto.fromTime * 1e3),
            end: new Date(dto.toTime * 1e3),
            production: Number(dto.energy) / 1e6,
            files: fileIds
        });

        const certificationRequest: CertificationRequest = await this.commandBus.execute(
            new CreateCertificationRequestCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                dto.files,
                dto.isPrivate
            )
        );

        const irecCertificationRequest = this.irecRepository.create({
            certificationRequestId: certificationRequest.id,
            organizationId: String(user.organizationId),
            irecIssueRequestId: irecIssue.code,
            irecTradeAccountCode: tradeAccount
        });
        await this.irecRepository.save(irecCertificationRequest);

        return {
            ...certificationRequest,
            irecIssueRequestId: irecCertificationRequest.irecIssueRequestId,
            organizationId: irecCertificationRequest.organizationId,
            irecAssetId: irecCertificationRequest.irecAssetId,
            irecTradeAccountCode: irecCertificationRequest.irecTradeAccountCode
        };
    }
}
