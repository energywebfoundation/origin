import { Contracts } from '@energyweb/issuer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ethers, providers, Contract } from 'ethers';
import { getProviderWithFallback } from '@energyweb/utils-general';

import { ConfigurationService } from '../configuration';
import { CertificateService } from './certificate.service';

@Injectable()
export class CertificationWatcherService implements OnModuleInit {
    private readonly logger = new Logger(CertificationWatcherService.name);

    private provider: providers.FallbackProvider;

    private issuer: Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly moduleRef: ModuleRef,
        private readonly certificateService: CertificateService
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

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        this.issuer = new ethers.Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        this.provider.on(
            this.issuer.filters.PrivateTransferRequested(null, null),
            (event: providers.Log) => this.registerPrivateTransferRequest(event)
        );

        this.provider.on(
            this.issuer.filters.MigrateToPublicRequested(null, null),
            (event: providers.Log) => this.registerMigrationRequest(event)
        );
    }

    private async registerPrivateTransferRequest(event: providers.Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.issuer.interface.parseLog(event);
        const log = this.issuer.interface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _certificateId } = log;

        await this.certificateService.approvePrivateTransfer(_certificateId.toNumber());
    }

    private async registerMigrationRequest(event: providers.Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.issuer.interface.parseLog(event);
        const log = this.issuer.interface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id } = log;

        await this.certificateService.migrateToPublic(_id.toNumber());
    }
}
