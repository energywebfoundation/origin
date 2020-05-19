import { Contracts } from '@energyweb/issuer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ethers } from 'ethers';
import { Log } from 'ethers/providers';

import { ConfigurationService } from '../configuration';
import { DeviceService } from '../device/device.service';
import { CertificateService } from './certificate.service';
import { UserService } from '../user';

@Injectable()
export class CertificationWatcherService implements OnModuleInit {
    private readonly logger = new Logger(CertificationWatcherService.name);

    private issuerInterface: ethers.utils.Interface;

    private provider: ethers.providers.JsonRpcProvider;

    private issuer: ethers.Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly moduleRef: ModuleRef,
        private readonly certificateService: CertificateService,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService
    ) {}

    public async onModuleInit() {
        this.logger.log('onModuleInit');

        const originBackendConfigurationService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const {
            contractsLookup: { issuer }
        } = await originBackendConfigurationService.get();

        try {
            ethers.utils.getAddress(issuer);
        } catch (e) {
            this.logger.error(
                `Issuer address "${issuer}" is not a contract address. Unable to initialize.`
            );
            return;
        }

        this.issuerInterface = new ethers.utils.Interface(Contracts.IssuerJSON.abi);

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);

        this.issuer = new ethers.Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        this.provider.on(this.issuer.filters.PrivateTransferRequested(null, null), (event: Log) =>
            this.registerPrivateTransferRequest(event)
        );

        this.provider.on(this.issuer.filters.MigrateToPublicRequested(null, null), (event: Log) =>
            this.registerMigrationRequest(event)
        );
    }

    private async registerPrivateTransferRequest(event: Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const log = this.issuerInterface.parseLog(event);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _certificateId } = log.values;

        await this.certificateService.approvePrivateTransfer(_certificateId.toNumber());
    }

    private async registerMigrationRequest(event: Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const log = this.issuerInterface.parseLog(event);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id } = log.values;

        await this.certificateService.migrateToPublic(_id.toNumber());
    }
}
