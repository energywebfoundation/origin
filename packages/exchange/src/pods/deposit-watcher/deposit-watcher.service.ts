import { Contracts } from '@energyweb/issuer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Log } from 'ethers/providers';

import { TransferService } from '../transfer/transfer.service';

@Injectable()
export class DepositWatcherService {
    private readonly logger = new Logger(DepositWatcherService.name);

    private readonly tokenInterface: ethers.utils.Interface;

    private readonly walletAddress: string;

    private readonly registryAddress: string;

    private readonly provider: ethers.providers.JsonRpcProvider;

    public constructor(
        private readonly configService: ConfigService,
        private readonly transferService: TransferService
    ) {
        const { abi } = Contracts.RegistryJSON;

        this.tokenInterface = new ethers.utils.Interface(abi);
        this.walletAddress = this.configService.get<string>('EXCHANGE_WALLET_PUB');
        this.registryAddress = this.configService.get<string>('REGISTRY_ADDRESS');

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);
    }

    public async init() {
        this.logger.debug(`Initializing watcher for ${this.registryAddress}`);

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
            await this.transferService.createDeposit({
                transactionHash,
                address: from as string,
                amount: value.toString(),
                asset: {
                    address: this.registryAddress,
                    tokenId: id.toString(),
                    // TODO: fetch the real device ID from contract after we agree on the structure of the bytes field
                    deviceId: 'dummy'
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
}
