import { Contracts } from '@energyweb/issuer';
import { ConfigurationService } from '@energyweb/origin-backend';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ethers } from 'ethers';
import { Log } from 'ethers/providers';
import moment from 'moment';

import { TransferService } from '../transfer/transfer.service';
import { TransferStatus } from '../transfer/transfer-status';

@Injectable()
export class DepositWatcherService implements OnModuleInit {
    private readonly logger = new Logger(DepositWatcherService.name);

    private tokenInterface: ethers.utils.Interface;

    private walletAddress: string;

    private registryAddress: string;

    private provider: ethers.providers.JsonRpcProvider;

    private issuer: ethers.Contract;

    private registry: ethers.Contract;

    public constructor(
        private readonly configService: ConfigService,
        private readonly transferService: TransferService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit() {
        this.logger.debug('onModuleInit');

        const originBackendConfigurationService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const {
            contractsLookup: { registry, issuer }
        } = await originBackendConfigurationService.get();

        this.tokenInterface = new ethers.utils.Interface(Contracts.RegistryJSON.abi);

        this.walletAddress = this.configService.get<string>('EXCHANGE_WALLET_PUB');
        this.registryAddress = registry;

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);

        this.registry = new ethers.Contract(
            this.registryAddress,
            Contracts.RegistryJSON.abi,
            this.provider
        );

        this.issuer = new ethers.Contract(issuer, Contracts.IssuerJSON.abi, this.provider);

        const topics = [this.tokenInterface.events.TransferSingle.topic];
        const blockNumber = await this.transferService.getLastConfirmationBlock();

        this.logger.debug(`Starting from block ${blockNumber}`);

        this.provider.resetEventsBlock(blockNumber);
        this.provider.on(
            {
                address: this.registryAddress,
                topics
            },
            (event: Log) => this.processEvent(event)
        );
    }

    private async processEvent(event: Log) {
        this.logger.debug(`Discovered new event ${JSON.stringify(event)}`);

        const log = this.tokenInterface.parseLog(event);

        this.logger.debug(`Parsed to ${JSON.stringify(log)}`);

        const { _from: from, _to: to, _value: value, _id: id } = log.values;

        if (to !== this.walletAddress) {
            this.logger.debug(
                `This transfer is to other address ${to} than wallet address ${this.walletAddress}`
            );
            return;
        }

        const { transactionHash } = event;

        try {
            const transfer = await this.transferService.findOne(null, {
                where: { transactionHash }
            });

            if (transfer) {
                this.logger.error(
                    `Deposit with transactionHash ${transactionHash} already exists and has status ${
                        TransferStatus[transfer.status]
                    } `
                );

                return;
            }

            const { generationFrom, generationTo, deviceId } = await this.decodeDataField(
                id.toString()
            );

            await this.transferService.createDeposit({
                transactionHash,
                address: from as string,
                amount: value.toString(),
                asset: {
                    address: this.registryAddress,
                    tokenId: id.toString(),
                    deviceId,
                    generationFrom,
                    generationTo
                }
            });

            const receipt = await this.provider.waitForTransaction(transactionHash);

            await this.transferService.setAsConfirmed(transactionHash, receipt.blockNumber);

            this.logger.debug(
                `Successfully created deposit of tokenId=${id} from ${from} with value=${value}`
            );
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    private async decodeDataField(certificateId: string) {
        const { data } = await this.registry.functions.getCertificate(certificateId);

        const result = await this.issuer.functions.decodeData(data);

        return {
            generationFrom: moment.unix(result[0]).toDate(),
            generationTo: moment.unix(result[1]).toDate(),
            deviceId: result[2]
        };
    }
}
