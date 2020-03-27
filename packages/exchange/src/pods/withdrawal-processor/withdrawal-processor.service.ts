import { Contracts } from '@energyweb/issuer';
import { ConfigurationService } from '@energyweb/origin-backend';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Contract, ContractTransaction, ethers, Wallet } from 'ethers';
import { Subject } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import { AccountBalanceService } from '../account-balance/account-balance.service';
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
        @Inject(forwardRef(() => AccountBalanceService))
        private readonly accountBalanceService: AccountBalanceService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit() {
        const wallet = this.configService.get<string>('EXCHANGE_WALLET_PRIV');
        if (!wallet) {
            this.logger.error('Wallet private key not provided');
            throw new Error('Wallet private key not provided');
        }
        const web3ProviderUrl = this.configService.get<string>('WEB3');
        const provider = new ethers.providers.JsonRpcProvider(web3ProviderUrl);

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
        if (balance.lt(ethers.utils.parseEther('1'))) {
            this.logger.error(
                `Withdrawal wallet has not enough EWT tokens, expected at least 1 but has ${ethers.utils.formatEther(
                    balance
                )}`
            );

            throw new Error('Not enough funds');
        }

        this.withdrawalQueue
            .pipe(
                tap(id => this.log(id)),
                concatMap(id => this.process(id))
            )
            .subscribe();

        const acceptedWithdrawals = await this.transferService.getByStatus(
            TransferStatus.Accepted,
            TransferDirection.Withdrawal
        );
        this.logger.debug(
            `Found ${acceptedWithdrawals.length} TransferStatus.Accepted withdrawals`
        );

        acceptedWithdrawals.forEach(withdrawal => this.requestWithdrawal(withdrawal));

        // TODO: handle unconfirmed withdrawals
    }

    public requestWithdrawal(withdrawal: Transfer) {
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

        const hasEnoughFunds = await this.accountBalanceService.hasEnoughAssetAmount(
            withdrawal.userId,
            withdrawal.asset.id,
            withdrawal.amount
        );
        if (!hasEnoughFunds) {
            this.logger.error(
                `[Withdrawal ${id}] User ${withdrawal.userId} has not enough funds to proceed`
            );
            await this.transferService.setAsError(id);
            return;
        }

        const transaction = (await this.registry.functions.safeTransferFrom(
            this.wallet.address,
            withdrawal.address,
            withdrawal.asset.tokenId,
            withdrawal.amount,
            '0x0' // TODO: consider putting withdrawal id for tracking
        )) as ContractTransaction;

        await this.transferService.setAsUnconfirmed(id, transaction.hash);

        const receipt = await transaction.wait();

        this.logger.debug(`Withdrawal ${id} receipt: ${JSON.stringify(receipt)} `);

        const hasLog = receipt.logs
            .map(log => this.tokenInterface.parseLog(log))
            .some(log => this.hasMatchingLog(withdrawal, log));

        if (!hasLog) {
            this.logger.error(
                `[Withdrawal ${id}] Expected event TransferSingle was not found in the transaction ${receipt.transactionHash}`
            );
            await this.transferService.setAsError(id);
            return;
        }

        await this.transferService.setAsConfirmed(transaction.hash, receipt.blockNumber);
    }

    private hasMatchingLog(withdrawal: Transfer, log: ethers.utils.LogDescription) {
        return (
            log.topic === this.tokenInterface.events.TransferSingle.topic &&
            log.values._id.toString() === withdrawal.asset.tokenId &&
            log.values._from === this.wallet.address &&
            log.values._to === withdrawal.address &&
            log.values._value.toString() === withdrawal.amount
            // TODO: consider better comparison than string === string
        );
    }
}
