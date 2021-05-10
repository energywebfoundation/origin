import { Contracts, CertificateUtils } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';
import { Contract, ethers, providers } from 'ethers';
import moment from 'moment';

import {
    IExchangeConfigurationService,
    TransferService,
    DepositDiscoveredEvent,
    CreateDepositDTO
} from '@energyweb/exchange';

@Injectable()
export class DepositWatcherService implements OnModuleInit {
    private readonly logger = new Logger(DepositWatcherService.name);

    private tokenInterface = new ethers.utils.Interface(Contracts.RegistryJSON.abi);

    private walletAddress: string;

    private registryAddress: string;

    private provider: providers.FallbackProvider;

    private issuer: Contract;

    private registry: Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly transferService: TransferService,
        private readonly eventBus: EventBus,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit(): Promise<void> {
        this.logger.debug('onModuleInit');

        const exchangeConfigService = this.moduleRef.get<IExchangeConfigurationService>(
            IExchangeConfigurationService,
            {
                strict: false
            }
        );

        this.walletAddress = this.configService.get<string>('EXCHANGE_WALLET_PUB');

        const issuer = await exchangeConfigService.getIssuerAddress();
        this.registryAddress = await exchangeConfigService.getRegistryAddress();

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        this.registry = new Contract(
            this.registryAddress,
            Contracts.RegistryJSON.abi,
            this.provider
        );

        this.issuer = new Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        const topics = [
            this.tokenInterface.getEventTopic(this.tokenInterface.getEvent('TransferSingle'))
        ];
        const blockNumber = await this.transferService.getLastConfirmationBlock();

        this.logger.debug(`Starting from block ${blockNumber}`);

        this.provider.resetEventsBlock(blockNumber);
        this.provider.on(
            {
                address: this.registryAddress,
                topics
            },
            (event: providers.Log) => this.processEvent(event)
        );
    }

    private async processEvent(event: providers.Log) {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const { name } = this.tokenInterface.parseLog(event);
        const log = this.tokenInterface.decodeEventLog(name, event.data, event.topics);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { transactionHash } = event;

        const [, from, to, id, value] = log;

        if (!value || !from || !to) {
            this.logger.error(`Received an incorrect event: ${JSON.stringify(event)}`);

            return;
        }

        if (to !== this.walletAddress) {
            this.logger.debug(
                `This transfer is to other address ${to} than wallet address ${this.walletAddress}`
            );
            return;
        }

        const { generationFrom, generationTo, deviceId } = await this.decodeDataField(
            id.toString()
        );

        const receipt = await this.provider.waitForTransaction(transactionHash);

        const deposit: CreateDepositDTO = {
            transactionHash,
            address: from,
            amount: value.toString(),
            blockNumber: receipt.blockNumber,
            asset: {
                address: this.registryAddress,
                tokenId: id.toString(),
                deviceId,
                generationFrom,
                generationTo
            }
        };

        this.eventBus.publish(new DepositDiscoveredEvent(deposit));
    }

    private async decodeDataField(certificateId: string) {
        const { data } = await this.registry.getCertificate(certificateId);

        const {
            generationStartTime,
            generationEndTime,
            deviceId
        } = await CertificateUtils.decodeData(data);

        return {
            generationFrom: moment.unix(generationStartTime).toDate(),
            generationTo: moment.unix(generationEndTime).toDate(),
            deviceId
        };
    }
}
