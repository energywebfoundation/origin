import { Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IrecService } from '@energyweb/origin-organization-irec-api';
import { AccountBalanceService, IExternalUserService } from '@energyweb/exchange';
import { GetCertificationRequestByCertificateQuery } from '@energyweb/issuer-irec-api';

import { ExportCertificateCommand } from '../command';
import { ModuleRef } from '@nestjs/core';

@CommandHandler(ExportCertificateCommand)
export class ExportCertificateHandler
    implements ICommandHandler<ExportCertificateCommand>, OnModuleInit
{
    private readonly logger = new Logger(ExportCertificateHandler.name);

    private userService: IExternalUserService;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly accountBalanceService: AccountBalanceService,
        private readonly irecService: IrecService,
        private readonly commandBus: CommandBus
    ) {}

    public async onModuleInit() {
        this.userService = this.moduleRef.get<IExternalUserService>(IExternalUserService, {
            strict: false
        });
    }

    async execute({
        user,
        certificateId,
        recipientTradeAccount
    }: ExportCertificateCommand): Promise<void> {
        this.logger.debug(
            `Checking certificate ownership user=${user.id} certificateId=${certificateId}`
        );
        const { available } = await this.accountBalanceService.getAccountBalance(user.ownerId);

        const certificate = available.find((c) => c.asset.id === certificateId);

        if (!certificate) {
            throw new NotFoundException(`Certificate with id=${certificateId} not found`);
        }

        const platformAdmin = await this.userService.getPlatformAdmin();

        const certificationRequest = await this.commandBus.execute(
            new GetCertificationRequestByCertificateQuery(Number(certificateId))
        );

        if (certificationRequest.organizationId !== user.ownerId) {
            throw new NotFoundException(`Certificate with id=${certificateId} not found`);
        }

        const irecCertificates = await this.irecService.getCertificates(
            platformAdmin.organization.id
        );
        const irecCertificate = irecCertificates.find(
            (c) => c.asset === certificationRequest.irecAssetId
        );

        if (!irecCertificate) {
            throw new NotFoundException(`Certificate with id=${certificateId} not found`);
        }

        await this.irecService.transferCertificate(
            platformAdmin.organization.id,
            recipientTradeAccount,
            irecCertificate.asset
        );

        // TODO: do something with the certificate in blockchain
    }
}
