import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';

import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { UserService } from '@energyweb/origin-backend';

import { ImportIrecCertificateCommand } from '../command';
import { IrecCertificateImportFailedEvent } from '../event/irec-certificate-import-failed.event';
import { IrecCertificateImportSuccessEvent } from '../event';

@CommandHandler(ImportIrecCertificateCommand)
export class ImportIrecCertificateHandler implements ICommandHandler<ImportIrecCertificateCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly irecDeviceService: DeviceService,
        private readonly userService: UserService
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

        // todo
        this.eventBus.publish(
            new IrecCertificateImportSuccessEvent(user, certificateToImport.assetId)
        );
    }
}
