import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';

import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { UserService } from '@energyweb/origin-backend';
import {
    ApproveCertificationRequestCommand,
    CreateCertificationRequestCommand,
    IrecCertificationRequest
} from '@energyweb/issuer-irec-api';
import { DeviceRegistryService } from '@energyweb/origin-device-registry-api';
import { ImportIrecCertificateCommand } from '../command';
import { IrecCertificateImportFailedEvent } from '../event';
import { ExportAccountingService } from '../../export/export-accounting.service';
import { AccountService } from '@energyweb/exchange';

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
        private readonly irecCertificationRequestRepository: Repository<IrecCertificationRequest>,
        private readonly exportAccountingService: ExportAccountingService,
        private readonly accountService: AccountService
    ) {}

    async execute({ user, certificateToImport }: ImportIrecCertificateCommand): Promise<void> {
        const irecCertificates = await this.irecService.getCertificates(
            user,
            certificateToImport.fromIrecAccountCode
        );
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
        if (!irecDevice || String(irecDevice.ownerId) !== String(user.ownerId)) {
            throw new BadRequestException('Unknown IREC device');
        }

        const [originDevice] = await this.deviceRegistryService.find({
            where: { externalRegistryId: irecDevice.id }
        });
        if (!originDevice) {
            throw new BadRequestException('Unknown IREC device');
        }

        const exportedCertificates = await this.exportAccountingService.findByOwner(user.ownerId);
        if (exportedCertificates.some((e) => e.irecAssetId === certificateToImport.assetId)) {
            throw new BadRequestException('The certificate is exported before');
        }

        const platformAdmin = await this.userService.getPlatformAdmin();
        const toTradeAccount =
            certificateToImport.toIrecAccountCode ||
            (await this.irecService.getTradeAccountCode(platformAdmin.organization.id));

        const transaction = await this.irecService.transferCertificate(
            user,
            toTradeAccount,
            certificateToImport.assetId,
            certificateToImport.fromIrecAccountCode
        );

        if (!transaction) {
            this.eventBus.publish(
                new IrecCertificateImportFailedEvent(user, certificateToImport.assetId)
            );
            throw new InternalServerErrorException('IREC API refuses to transfer certificate');
        }

        const userExchangeAddress = await this.accountService.getAccount(user.ownerId);
        const certificationRequest = await this.commandBus.execute(
            new CreateCertificationRequestCommand(
                userExchangeAddress?.address || user.blockchainAccountAddress,
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
                organizationId: String(user.organizationId),
                irecTradeAccountCode: toTradeAccount
            })
        );

        await this.commandBus.execute(
            new ApproveCertificationRequestCommand(certificationRequest.id)
        );
    }
}
