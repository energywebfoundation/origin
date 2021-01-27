import { Contracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Contract, ethers, providers } from 'ethers';
import moment from 'moment';

import {
    IExchangeConfigurationService,
    IExternalDeviceService,
    AccountService,
    CreateAskDTO,
    OrderService,
    TransferStatus,
    TransferService,
    Transfer,
    TransferDirection
} from '@energyweb/exchange';
import { concatMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class DepositWatcherService<TProduct> implements OnModuleInit {
    private readonly logger = new Logger(DepositWatcherService.name);

    private registry: ethers.Contract;

    private walletAddress: string;

    private tokenInterface: ethers.utils.Interface;

    private provider: providers.FallbackProvider;

    private issuer: Contract;

    private issuerTypeId: string;

    private deviceService: IExternalDeviceService;

    private registryAddress: string;

    private readonly depositQueue = new Subject<string>();

    public constructor(
        private readonly configService: ConfigService,
        private readonly transferService: TransferService,
        private readonly orderService: OrderService<TProduct>,
        private readonly accountService: AccountService,
        private readonly moduleRef: ModuleRef
    ) {
        this.issuerTypeId = this.configService.get<string>('ISSUER_ID');
    }

    public async onModuleInit() {
        this.logger.debug('onModuleInit');
        this.deviceService = this.moduleRef.get<IExternalDeviceService>(IExternalDeviceService, {
            strict: false
        });

        this.walletAddress = this.configService.get<string>('EXCHANGE_WALLET_PUB');

        const web3ProviderUrl = this.configService.get<string>('WEB3');
        this.provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        const exchangeConfigService = this.moduleRef.get<IExchangeConfigurationService>(
            IExchangeConfigurationService,
            {
                strict: false
            }
        );

        this.registryAddress = await exchangeConfigService.getRegistryAddress();
        const { abi } = Contracts.RegistryJSON;

        this.registry = new Contract(this.registryAddress, abi, this.provider);

        this.tokenInterface = new ethers.utils.Interface(abi);

        const blockNumber = await this.transferService.getLastConfirmationBlock();

        this.logger.debug(`Starting from block ${blockNumber}`);

        this.depositQueue
            .pipe(
                tap((id) => this.logger.debug(`[Deposit ${id}] enqueued ${id}`)),
                concatMap((id) => this.process(id))
            )
            .subscribe();
    }

    public requestDeposit(deposit: Transfer): void {
        const { id } = deposit;
        this.logger.log(`[Deposit ${id}] requested processing`);
        this.logger.debug(`[Deposit ${id}] requested processing ${JSON.stringify(deposit)}`);

        if (deposit.direction !== TransferDirection.Deposit) {
            this.logger.error(`[Deposit ${id}] expected but got withdrawal`);

            throw new Error('Expected deposit but got withdrawal');
        }

        this.depositQueue.next(deposit.id);
    }

    private async process(id: string) {
        this.logger.debug(`[Deposit ${id}] starting processing`);

        try {
            let deposit = await this.transferService.findOne(id);

            if (!deposit) {
                this.logger.error(`[Deposit ${id}] Unknown deposit. Skipping.`);
                return;
            }

            this.logger.debug(`[Deposit ${id}] ${JSON.stringify(deposit)}`);

            if (deposit.address !== this.walletAddress) {
                this.logger.debug(
                    `This transfer is to other address ${deposit.address} than wallet address ${this.walletAddress}`
                );
            }

            if (deposit) {
                this.logger.debug(
                    `Deposit with transactionHash ${
                        deposit.transactionHash
                    } already exists and has status ${TransferStatus[deposit.status]} `
                );

                return;
            }

            const { generationFrom, generationTo, deviceId } = await this.decodeDataField(
                id.toString()
            );

            const { amount, transactionHash } = deposit;

            deposit = await this.transferService.createDeposit({
                transactionHash,
                address: deposit.address,
                amount,
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
                `Successfully created deposit of tokenId=${deposit.id} from=${deposit.address} with value=${deposit.amount} for user=${deposit.userId} `
            );

            await this.tryPostForSale(deviceId, deposit.address, amount, deposit.asset.id);
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    private async decodeDataField(certificateId: string) {
        const { data } = await this.registry.getCertificate(certificateId);

        const result = await this.issuer.decodeData(data);

        return {
            generationFrom: moment.unix(result[0]).toDate(),
            generationTo: moment.unix(result[1]).toDate(),
            deviceId: result[2]
        };
    }

    private async tryPostForSale(
        deviceId: string,
        sender: string,
        amount: string,
        assetId: string
    ) {
        this.logger.debug(
            `Trying to post for sale deviceId=${deviceId} sender=${sender} amount=${amount} assetId=${assetId}`
        );

        const { postForSale, postForSalePrice } = await this.deviceService.getDeviceSettings({
            id: deviceId,
            type: this.issuerTypeId
        });
        const { userId } = await this.accountService.findByAddress(sender);

        if (!postForSale) {
            this.logger.debug(`Device ${deviceId} does not have automaticPostForSale enabled`);
            return;
        }

        const ask: CreateAskDTO = {
            price: postForSalePrice,
            validFrom: new Date(),
            volume: amount,
            assetId
        };
        await this.orderService.createAsk(userId, ask);
    }
}
