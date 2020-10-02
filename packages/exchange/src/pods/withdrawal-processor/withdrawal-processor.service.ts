import { Contracts } from '@energyweb/issuer';
import { ConfigurationService } from '@energyweb/origin-backend';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Contract, ContractTransaction, ethers, Wallet, ContractReceipt } from 'ethers';
import { Subject } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import { TransferDirection } from '../transfer/transfer-direction';
import { TransferStatus } from '../transfer/transfer-status';
import { Transfer } from '../transfer/transfer.entity';
import { TransferService } from '../transfer/transfer.service';

@Injectable()
export class WithdrawalProcessorService implements OnModuleInit {
    private readonly logger = new Logger(WithdrawalProcessorService.name);

    private wallet: ethers.Wallet;

    private readonly withdrawalQueue = new Subject<string>();

    private registry: ethers.Contract;

    private tokenInterface: ethers.utils.Interface;

    public constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => TransferService))
        private readonly transferService: TransferService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit() {
        const wallet = this.configService.get<string>('EXCHANGE_WALLET_PRIV');
        if (!wallet) {
            this.logger.error('Wallet private key not provided');
            throw new Error('Wallet private key not provided');
        }
        const web3ProviderUrl = this.configService.get<string>('WEB3');
        const provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        this.wallet = new Wallet(wallet, provider);

        const originBackendConfigurationService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const {
            contractsLookup: { registry }
        } = await originBackendConfigurationService.get();

        const { abi } = Contracts.RegistryJSON;

        this.registry = new Contract(registry, abi, this.wallet);
        this.tokenInterface = new ethers.utils.Interface(abi);

        this.logger.log(
            `Initializing withdrawal processor for ${this.registry.address} using ${this.wallet.address}`
        );

        const balance = await this.wallet.getBalance();
        const minBalance = ethers.utils.parseEther(
            this.configService.get<string>('EXCHANGE_WALLET_MIN_EWT') ?? '1'
        );

        if (balance.lt(minBalance)) {
            this.logger.error(
                `Withdrawal wallet has not enough EWT tokens, expected at least ${ethers.utils.formatEther(
                    minBalance
                )} but has ${ethers.utils.formatEther(balance)}`
            );

            throw new Error('Not enough funds');
        }

        this.withdrawalQueue
            .pipe(
                tap((id) => this.log(id)),
                concatMap((id) => this.process(id))
            )
            .subscribe();

        await this.processAcceptedWithdrawals();
        await this.processUnconfirmedWithdrawals();
    }

    public requestWithdrawal(withdrawal: Transfer): void {
        const { id } = withdrawal;
        this.logger.log(`[Withdrawal ${id}] Requested processing`);
        this.logger.debug(`[Withdrawal ${id}] Requested processing ${JSON.stringify(withdrawal)}`);

        if (withdrawal.direction !== TransferDirection.Withdrawal) {
            this.logger.error(`[Withdrawal ${id}] Expected withdrawal but got deposit`);

            throw new Error('Expected withdrawal but got deposit');
        }

        this.withdrawalQueue.next(withdrawal.id);
    }

    private log(id: string) {
        this.logger.debug(`[Withdrawal ${id}] Enqueued ${id}`);
    }

    private async process(id: string) {
        this.logger.debug(`[Withdrawal ${id}] Starting processing`);
        const withdrawal = await this.transferService.findOne(id);

        if (!withdrawal) {
            this.logger.error(`[Withdrawal ${id}] Unknown withdrawal. Skipping.`);
            return;
        }

        this.logger.debug(`[Withdrawal ${id}] ${JSON.stringify(withdrawal)}`);

        if (withdrawal.status !== TransferStatus.Accepted) {
            this.logger.error(
                `[Withdrawal ${id}] Expected status Accepted but got ${
                    TransferStatus[withdrawal.status]
                } instead`
            );
            return;
        }
        const transaction = (await this.registry.safeTransferFrom(
            this.wallet.address,
            withdrawal.address,
            withdrawal.asset.tokenId,
            withdrawal.amount,
            '0x00' // TODO: consider putting withdrawal id for tracking
        )) as ContractTransaction;

        await this.transferService.setAsUnconfirmed(id, transaction.hash);

        const receipt = await transaction.wait();

        await this.handleConfirmation(withdrawal, receipt);
    }

    private async processAcceptedWithdrawals() {
        const withdrawals = await this.transferService.getByStatus(
            TransferStatus.Accepted,
            TransferDirection.Withdrawal
        );
        this.logger.debug(`Found ${withdrawals.length} TransferStatus.Accepted withdrawals`);

        withdrawals.forEach((withdrawal) => this.requestWithdrawal(withdrawal));
    }

    private async processUnconfirmedWithdrawals() {
        const withdrawals = await this.transferService.getByStatus(
            TransferStatus.Unconfirmed,
            TransferDirection.Withdrawal
        );
        this.logger.debug(`Found ${withdrawals.length} TransferStatus.Unconfirmed withdrawals`);

        for (const withdrawal of withdrawals) {
            const transaction = await this.wallet.provider.getTransaction(
                withdrawal.transactionHash
            );
            const receipt = await transaction.wait();

            await this.handleConfirmation(withdrawal, receipt);
        }
    }

    private async handleConfirmation(
        withdrawal: Transfer,
        { transactionHash, logs, blockNumber }: ContractReceipt
    ) {
        const { id } = withdrawal;

        const hasLog = logs
            .map((log) => this.tokenInterface.parseLog(log))
            .filter((log) => log.name === 'TransferSingle')
            .some((log) => this.hasMatchingLog(withdrawal, log));

        if (!hasLog) {
            this.logger.error(
                `[Withdrawal ${id}] Expected event TransferSingle was not found in the transaction ${transactionHash}`
            );
            await this.transferService.setAsError(id);
        } else {
            await this.transferService.setAsConfirmed(transactionHash, blockNumber);
        }
    }

    private hasMatchingLog(withdrawal: Transfer, { args }: ethers.utils.LogDescription) {
        const _to = String(args._to).toLowerCase();
        const _from = String(args._from).toLowerCase();

        return (
            args._id.toString() === withdrawal.asset.tokenId &&
            _from === this.wallet.address.toLowerCase() &&
            _to === withdrawal.address.toLowerCase() &&
            args._value.toString() === withdrawal.amount
        );
    }
}
