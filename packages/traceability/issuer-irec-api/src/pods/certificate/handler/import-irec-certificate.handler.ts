import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';

import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { UserService } from '@energyweb/origin-backend';

import { ImportIrecCertificateCommand } from '../command';
import { IrecCertificateImportFailedEvent } from '../event';
import {
    ApproveCertificationRequestCommand,
    CreateCertificationRequestCommand
} from '@energyweb/issuer-api';
import { DeviceRegistryService } from '@energyweb/origin-device-registry-api';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IrecCertificationRequest } from '../../certification-request';

@CommandHandler(ImportIrecCertificateCommand)
export class ImportIrecCertificateHandler implements ICommandHandler<ImportIrecCertificateCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly irecDeviceService: DeviceService,
        private readonly deviceRegistryService: DeviceRegistryService,
        private readonly userService: UserService,
        @InjectRepository(IrecCertificationRequest)
        private readonly irecCertificationRequestRepository: Repository<IrecCertificationRequest>
    ) {}

    async execute({ user, certificateToImport }: ImportIrecCertificateCommand): Promise<void> {
        const irecCertificates = await this.irecService.getCertificates(user);
        const irecCertificate = irecCertificates.find(
            (c) => c.asset === certificateToImport.assetId
        );

        if (!irecCertificate) {
            throw new BadRequestException(
                `IREC certificate for asset ${certificateToImport.assetId} not found`
            );
        }

        const irecDevices = await this.irecDeviceService.findAll({
            where: { ownerId: user.ownerId }
        });
        const irecDevice = irecDevices.find((d) => d.code === irecCertificate.device.code);
        if (!irecDevice || irecDevice.ownerId !== user.ownerId) {
            throw new BadRequestException('Unknown IREC device');
        }

        const [originDevice] = await this.deviceRegistryService.find({
            where: { externalRegistryId: irecDevice.id }
        });
        if (!originDevice) {
            throw new BadRequestException('Unknown IREC device');
        }

        const platformAdmin = await this.userService.getPlatformAdmin();
        const transaction = await this.irecService.transferCertificate(
            user,
            platformAdmin.organization.id,
            certificateToImport.assetId
        );

        if (!transaction) {
            this.eventBus.publish(
                new IrecCertificateImportFailedEvent(user, certificateToImport.assetId)
            );
            throw new InternalServerErrorException('IREC API refuses to transfer certificate');
        }

        const certificationRequest = await this.commandBus.execute(
            new CreateCertificationRequestCommand(
                user.blockchainAccountAddress,
                String(irecCertificate.volume * 1e6),
                new Date(irecCertificate.startDate).getTime() / 1000,
                new Date(irecCertificate.endDate).getTime() / 1000,
                originDevice.id,
                [],
                true
            )
        );

        await this.irecCertificationRequestRepository.save(
            this.irecCertificationRequestRepository.create({
                certificationRequestId: certificationRequest.id,
                irecAssetId: certificateToImport.assetId,
                organizationId: String(user.organizationId)
            })
        );

        await this.commandBus.execute(
            new ApproveCertificationRequestCommand(certificationRequest.id)
        );
    }
}
