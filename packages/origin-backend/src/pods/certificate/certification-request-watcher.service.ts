import { Contracts } from '@energyweb/issuer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ethers } from 'ethers';
import { Log } from 'ethers/providers';

import { ConfigurationService } from '../configuration';
import { DeviceService } from '../device/device.service';
import { CertificationRequestService } from './certification-request.service';

@Injectable()
export class CertificationRequestWatcherService implements OnModuleInit {
    private readonly logger = new Logger(CertificationRequestWatcherService.name);

    private issuerInterface: ethers.utils.Interface;

    private provider: ethers.providers.JsonRpcProvider;

    private issuer: ethers.Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly moduleRef: ModuleRef,
        private readonly certificationRequestService: CertificationRequestService,
        private readonly deviceService: DeviceService
    ) {}

    public async onModuleInit() {
        this.logger.log('onModuleInit');

        const originBackendConfigurationService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const {
            contractsLookup: { issuer }
        } = await originBackendConfigurationService.get();

        this.issuerInterface = new ethers.utils.Interface(Contracts.IssuerJSON.abi);

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);

        this.issuer = new ethers.Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        this.provider.on(
            this.issuer.filters.CertificationRequested(null, null, null),
            (event: Log) => this.processEvent(event)
        );
    }

    private async processEvent(event: Log): Promise<void> {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const log = this.issuerInterface.parseLog(event);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _id } = log.values;

        const exists = await this.certificationRequestService.get(_id);

        if (exists) {
            this.logger.debug(`CertificationRequest ${_id} already created.`);
            return;
        }

        const certRequestInfo = await this.issuer.getCertificationRequest(_id);
        const decodedData = await this.issuer.decodeData(certRequestInfo.data);

        const deviceId = decodedData['2'];
        const device = await this.deviceService.findByExternalId({
            id: deviceId,
            type: process.env.ISSUER_ID
        });

        if (!device) {
            this.logger.error(`Device with ID ${deviceId} doesn't exist.`);
            return;
        }

        const creationBlock = await this.issuer.provider.getBlock(event.blockNumber);

        const certificationRequest = await this.certificationRequestService.create({
            id: _id.toNumber(),
            owner: certRequestInfo.owner,
            fromTime: Number(decodedData['0']),
            toTime: Number(decodedData['1']),
            device,
            approved: certRequestInfo.approved,
            revoked: certRequestInfo.revoked,
            created: Number(creationBlock.timestamp)
        });

        this.logger.log(
            `Read certification request ${certificationRequest.id} from the blockchain and stored it.`
        );
    }
}
