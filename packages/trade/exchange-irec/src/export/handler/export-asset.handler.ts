import BN from 'bn.js';
import {
    Inject,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';
import { QueryBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IrecService, IREC_SERVICE } from '@energyweb/origin-organization-irec-api';
import { AccountBalanceService, IExternalUserService } from '@energyweb/exchange';
import { GetCertificationRequestByCertificateQuery } from '@energyweb/issuer-irec-api';

import { ExportAssetCommand } from '../command';
import { ExportedAsset } from '../exported.entity';

@CommandHandler(ExportAssetCommand)
export class ExportAssetHandler implements ICommandHandler<ExportAssetCommand>, OnModuleInit {
    private readonly logger = new Logger(ExportAssetHandler.name);

    private userService: IExternalUserService;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly accountBalanceService: AccountBalanceService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly queryBus: QueryBus,
        @InjectRepository(ExportedAsset)
        private readonly repository: Repository<ExportedAsset>
    ) {}

    public async onModuleInit() {
        this.userService = this.moduleRef.get<IExternalUserService>(IExternalUserService, {
            strict: false
        });
    }

    async execute({
        user,
        assetId,
        recipientTradeAccount,
        amount,
        fromTradeAccount
    }: ExportAssetCommand): Promise<void> {
        this.logger.debug(`Checking certificate ownership user=${user.id} assetId=${assetId}`);
        const { available } = await this.accountBalanceService.getAccountBalance(user.ownerId);

        const asset = available.find((c) => c.asset.id === assetId && c.amount.gte(new BN(amount)));

        if (!asset) {
            throw new NotFoundException(`Asset with id=${assetId} not found or not enough balance`);
        }

        const { organization: platformOrganization } = await this.userService.getPlatformAdmin();

        const certificationRequest = await this.queryBus.execute(
            new GetCertificationRequestByCertificateQuery(Number(asset.asset.tokenId))
        );

        if (certificationRequest.organizationId !== user.ownerId) {
            throw new NotFoundException(
                `Your organization ${user.ownerId} doesn't own this certification request`
            );
        }

        const irecCertificates = await this.irecService.getCertificates(
            platformOrganization.id,
            fromTradeAccount
        );
        const irecCertificate = irecCertificates.find(
            // Uncomment the end of the line for testing with I-REC mock service
            (c) => c.asset === certificationRequest.irecAssetId // || c.asset === 'test-asset-id'
        );

        if (!irecCertificate) {
            throw new NotFoundException(`Certificate with id=${asset.asset.tokenId} not found`);
        }

        const result = await this.irecService.transferCertificate(
            platformOrganization.id,
            recipientTradeAccount,
            irecCertificate.asset,
            fromTradeAccount,
            amount
        );

        if (!result) {
            const message = `Unable to transfer certificate ${irecCertificate.code} in the I-REC registry.`;
            this.logger.error(message);
            this.logger.error(JSON.stringify(result));
            throw new InternalServerErrorException(message);
        }

        await this.repository.save({
            assetId: asset.asset.id,
            ownerId: user.ownerId,
            amount,
            irecAssetId: result.code
        });
    }
}
