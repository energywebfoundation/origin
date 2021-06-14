import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    BlockchainPropertiesService,
    CertificationRequest,
    CreateCertificationRequestCommand
} from '@energyweb/issuer-api';
import { FileService, UserService } from '@energyweb/origin-backend';

import { CreateIrecCertificationRequestCommand } from '../commands';
import { IrecCertificateService } from '../irec-certificate.service';
import { FullCertificationRequestDTO } from '../full-certification-request.dto';
import { IrecCertificationRequest } from '../irec-certification-request.entity';

@CommandHandler(CreateIrecCertificationRequestCommand)
export class CreateIrecCertificationRequestHandler
    implements ICommandHandler<CreateIrecCertificationRequestCommand>
{
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        readonly blockchainPropertiesService: BlockchainPropertiesService,

        @InjectRepository(IrecCertificationRequest)
        readonly irecRepository: Repository<IrecCertificationRequest>,
        readonly eventBus: EventBus,
        readonly commandBus: CommandBus,
        readonly irecCertificateService: IrecCertificateService,
        readonly userService: UserService,
        readonly fileService: FileService
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
            userId: String(params.user.id)
        });
        await this.irecRepository.save(irecCertificationRequest);

        await this.createIrecIssuanceRequest(certificationRequest);

        return { ...certificationRequest, userId: irecCertificationRequest.userId };
    }

    async createIrecIssuanceRequest(request: CertificationRequest): Promise<void> {
        const irecCertificationRequest = await this.irecRepository.findOne({
            certificationRequestId: request.id
        });
        const { userId } = irecCertificationRequest;

        const platformAdmin = await this.userService.getPlatformAdmin();

        let fileIds: string[];
        if (request.files?.length) {
            const files = await Promise.all(
                request.files.map((fileId) => this.fileService.get(fileId))
            );
            fileIds = await this.irecCertificateService.uploadFiles(
                userId,
                files.map((file) => file.data)
            );
        }

        const irecDevice = await this.irecCertificateService.getDevice(userId, request.deviceId);
        const platformTradeAccount = await this.irecCertificateService.getTradeAccountCode(
            platformAdmin.id
        );
        const irecIssue = await this.irecCertificateService.createIrecIssue(platformAdmin.id, {
            device: request.deviceId,
            fuelType: irecDevice.fuelType,
            recipient: platformTradeAccount,
            start: new Date(request.fromTime),
            end: new Date(request.toTime),
            production: Number(request.energy)
        });
        await this.repository.update(request.id, { files: fileIds });
        await this.irecRepository.update(irecCertificationRequest.certificationRequestId, {
            irecIssueId: irecIssue.code
        });
    }
}
