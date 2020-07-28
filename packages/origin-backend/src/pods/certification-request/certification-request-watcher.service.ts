import { Contracts } from '@energyweb/issuer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ethers, providers } from 'ethers';
import { getProviderWithFallback } from '@energyweb/utils-general';

import { DeepPartial } from 'typeorm';
import { ConfigurationService } from '../configuration';
import { DeviceService } from '../device/device.service';
import { CertificationRequestService } from './certification-request.service';
import { CertificateService } from '../certificate/certificate.service';
import { UserService } from '../user';
import { Device } from '../device/device.entity';

@Injectable()
export class CertificationRequestWatcherService implements OnModuleInit {
    private readonly logger = new Logger(CertificationRequestWatcherService.name);

    private issuerInterface: ethers.utils.Interface;

    private provider: ethers.providers.FallbackProvider;

    private issuer: ethers.Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly moduleRef: ModuleRef,
        private readonly certificateService: CertificateService,
        private readonly certificationRequestService: CertificationRequestService,
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
        this.provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        this.issuer = new ethers.Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        this.provider.on(
            this.issuer.filters.CertificationRequested(null, null, null),
            (event: providers.Log) => this.registerNewRequest(event)
        );

        this.provider.on(
            this.issuer.filters.CertificationRequestApproved(null, null, null),
            (event: providers.Log) => this.registerApproved(event)
        );

        this.provider.on(
            this.issuer.filters.CertificationRequestRevoked(null, null),
            (event: providers.Log) => this.registerRevoked(event)
        );
    }

    private async registerNewRequest(event: providers.Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.issuerInterface.parseLog(event);
        const log = this.issuerInterface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id } = log;

        const exists = await this.certificationRequestService.get(_id.toNumber());

        if (exists) {
            this.logger.debug(`CertificationRequest ${_id} already created.`);
            return;
        }

        const {
            owner,
            revoked,
            approved,
            data,
            sender
        } = await this.issuer.getCertificationRequest(_id);
        const [fromTime, toTime, deviceId] = await this.issuer.decodeData(data);

        const device = await this.deviceService.findByExternalId({
            id: deviceId,
            type: process.env.ISSUER_ID
        });

        if (!device) {
            this.logger.error(`Device with ID ${deviceId} doesn't exist.`);
            return;
        }

        const { timestamp: created } = await this.issuer.provider.getBlock(event.blockNumber);
        const user = await this.userService.findByBlockchainAccount(sender);

        if (!user) {
            this.logger.error(`Encountered request from unknown address ${sender}`);
            return;
        }

        const certificationRequest = await this.certificationRequestService.create({
            id: _id.toNumber(),
            owner,
            userId: user.organization.toString(),
            fromTime: fromTime.toNumber(),
            toTime: toTime.toNumber(),
            device: (device as unknown) as DeepPartial<Device>,
            approved,
            revoked,
            created
        });

        this.logger.log(
            `Read certification request ${certificationRequest.id} from the blockchain and stored it.`
        );
    }

    private async registerApproved(event: providers.Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.issuerInterface.parseLog(event);
        const log = this.issuerInterface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id, _owner } = log;

        const certificationRequest = await this.certificationRequestService.get(_id.toNumber());

        if (!certificationRequest) {
            this.logger.error(
                `CertificationRequest with ID ${_id} has been approved, but wasn't initialized in the database.`
            );
            return;
        }

        if (certificationRequest.approved) {
            this.logger.error(`CertificationRequest ${_id} already been approved.`);
            return;
        }

        await this.certificationRequestService.registerApproved(_id.toNumber());
        await this.certificateService.create({
            id: _id.toNumber(),
            originalRequestor: _owner
        });

        this.logger.log(
            `Registered approved certification request with ID ${certificationRequest.id}.`
        );
    }

    private async registerRevoked(event: providers.Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.issuerInterface.parseLog(event);
        const log = this.issuerInterface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id } = log;

        const certificationRequest = await this.certificationRequestService.get(_id.toNumber());

        if (!certificationRequest) {
            this.logger.error(
                `CertificationRequest with ID ${_id} has been revoked, but wasn't initialized in the database.`
            );
            return;
        }

        if (certificationRequest.revoked) {
            this.logger.error(`CertificationRequest ${_id} already been revoked.`);
            return;
        }

        await this.certificationRequestService.registerRevoked(_id);

        this.logger.log(
            `Registered revoked certification request with ID ${certificationRequest.id}.`
        );
    }
}
