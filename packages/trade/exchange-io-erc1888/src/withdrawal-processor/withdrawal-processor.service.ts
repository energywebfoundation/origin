import { getProviderWithFallback } from '@energyweb/utils-general';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { BigNumber, ContractReceipt, ContractTransaction, ethers, Wallet } from 'ethers';
import { Subject } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import {
    IExchangeConfigurationService,
    TransferDirection,
    TransferStatus,
    Transfer,
    TransferService
} from '@energyweb/exchange';
import { Certificate, Contracts, IBlockchainProperties } from '@energyweb/issuer';

@Injectable()
export class WithdrawalProcessorService implements OnModuleInit {
    private readonly logger = new Logger(WithdrawalProcessorService.name);

    private wallet: ethers.Wallet;

    private readonly transferQueue = new Subject<string>();

    private blockchainProperties: IBlockchainProperties;

    public constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => TransferService))
        private readonly transferService: TransferService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async onModuleInit() {
        const walletPrivateKey = this.configService.get<string>('EXCHANGE_WALLET_PRIV');
        if (!walletPrivateKey) {
            this.logger.error('Wallet private key not provided');
            throw new Error('Wallet private key not provided');
        }
        const web3ProviderUrl = this.configService.get<string>('WEB3');
        const provider = getProviderWithFallback(...web3ProviderUrl.split(';'));

        const exchangeConfigService = this.moduleRef.get<IExchangeConfigurationService>(
            IExchangeConfigurationService,
            {
                strict: false
            }
        );

        this.wallet = new Wallet(walletPrivateKey, provider);
        const registryAddress = await exchangeConfigService.getRegistryAddress();
        const issuerAddress = await exchangeConfigService.getIssuerAddress();

        this.blockchainProperties = {
            web3: provider,
            registry: Contracts.factories.RegistryFactory.connect(registryAddress, this.wallet),
            issuer: Contracts.factories.IssuerFactory.connect(issuerAddress, this.wallet),
            activeUser: this.wallet
        };

        this.logger.log(
            `Initializing transfer processor for ${this.blockchainProperties.registry.address} using ${this.wallet.address}`
        );

        const balance = await this.wallet.getBalance();
        const minBalance = ethers.utils.parseEther(
            this.configService.get<string>('EXCHANGE_WALLET_MIN_EWT') ?? '1'
        );

        if (balance.lt(minBalance)) {
            this.logger.error(
                `Transfer wallet has not enough EWT tokens, expected at least ${ethers.utils.formatEther(
                    minBalance
                )} but has ${ethers.utils.formatEther(balance)}`
            );

            throw new Error('Not enough funds');
        }

        this.transferQueue
            .pipe(
                tap((id) => this.logger.debug(`[Transfer ${id}] Enqueued ${id}`)),
                concatMap((id) => this.process(id))
            )
            .subscribe();

        await this.processAcceptedWithdrawals();
        await this.processAcceptedClaims();
        await this.processAcceptedSends();
        await this.processUnconfirmedWithdrawals();
        await this.processUnconfirmedClaims();
        await this.processUnconfirmedSends();
    }

    public request(transfer: Transfer): void {
        const { id } = transfer;
        this.logger.log(`[${transfer.direction} ${id}] Requested processing`);
        this.logger.debug(
            `[${transfer.direction} ${id}] Requested processing ${JSON.stringify(transfer)}`
        );

        if (transfer.direction === TransferDirection.Deposit) {
            const errorMessage = `Expected ${TransferDirection.Withdrawal}/${TransferDirection.Claim}/${TransferDirection.Send} but got ${transfer.direction}`;

            this.logger.error(`[${transfer.direction} ${id}] ${errorMessage}`);

            throw new Error(errorMessage);
        }

        this.transferQueue.next(transfer.id);
    }

    private async process(id: string) {
        this.logger.debug(`[Transfer ${id}] Starting processing`);
        const transfer = await this.transferService.findOne(id);

        if (!transfer) {
            this.logger.error(`[Transfer ${id}] Unknown transfer. Skipping.`);
            return;
        }

        this.logger.debug(`[Transfer ${id}] ${JSON.stringify(transfer)}`);

        if (transfer.status !== TransferStatus.Accepted) {
            this.logger.error(
                `[Transfer ${id}] Expected status ${TransferStatus.Accepted} but got ${transfer.status} instead`
            );
            return;
        }

        let result: ContractTransaction;

        try {
            const certificate = await new Certificate(
                Number(transfer.asset.tokenId),
                this.blockchainProperties
            ).sync();

            if (
                transfer.direction === TransferDirection.Withdrawal ||
                transfer.direction === TransferDirection.Send
            ) {
                result = await certificate.transfer(
                    transfer.address,
                    BigNumber.from(transfer.amount)
                );
            } else if (transfer.direction === TransferDirection.Claim) {
                result = await certificate.claim(
                    {
                        beneficiary: transfer.address,
                        location: '',
                        countryCode: '',
                        periodStartDate: '',
                        periodEndDate: '',
                        purpose: ''
                    },
                    BigNumber.from(transfer.amount)
                );
            } else {
                throw Error(`Unable to process transfer with direction ${transfer.direction}.`);
            }

            await this.transferService.setAsUnconfirmed(id, result.hash);

            const receipt = await result.wait();

            await this.handleConfirmation(transfer, receipt);
        } catch (error) {
            this.logger.error(`[Transfer ${id}] Error processing transfer: ${error.message}`);
            this.logger.error(`[Transfer ${id}] Error trace: ${JSON.stringify(error)}`);
        }
    }

    private async processAcceptedWithdrawals() {
        const withdrawals = await this.transferService.getByStatus(
            TransferStatus.Accepted,
            TransferDirection.Withdrawal
        );
        this.logger.debug(`Found ${withdrawals.length} ${TransferStatus.Accepted} withdrawals`);

        withdrawals.forEach((withdrawal) => this.request(withdrawal));
    }

    private async processAcceptedClaims() {
        const claims = await this.transferService.getByStatus(
            TransferStatus.Accepted,
            TransferDirection.Claim
        );
        this.logger.debug(`Found ${claims.length} ${TransferStatus.Accepted} claims`);

        claims.forEach((claim) => this.request(claim));
    }

    private async processAcceptedSends() {
        const sends = await this.transferService.getByStatus(
            TransferStatus.Accepted,
            TransferDirection.Send
        );
        this.logger.debug(`Found ${sends.length} ${TransferStatus.Accepted} sends`);

        sends.forEach((send) => this.request(send));
    }

    private async processUnconfirmedWithdrawals() {
        const withdrawals = await this.transferService.getByStatus(
            TransferStatus.Unconfirmed,
            TransferDirection.Withdrawal
        );
        this.logger.debug(`Found ${withdrawals.length} ${TransferStatus.Unconfirmed} withdrawals`);

        for (const withdrawal of withdrawals) {
            const transaction = await this.wallet.provider.getTransaction(
                withdrawal.transactionHash
            );
            const receipt = await transaction.wait();

            await this.handleConfirmation(withdrawal, receipt);
        }
    }

    private async processUnconfirmedClaims() {
        const claims = await this.transferService.getByStatus(
            TransferStatus.Unconfirmed,
            TransferDirection.Claim
        );
        this.logger.debug(`Found ${claims.length} ${TransferStatus.Unconfirmed} claims`);

        for (const claim of claims) {
            const transaction = await this.wallet.provider.getTransaction(claim.transactionHash);
            const receipt = await transaction.wait();

            await this.handleConfirmation(claim, receipt);
        }
    }

    private async processUnconfirmedSends() {
        const sends = await this.transferService.getByStatus(
            TransferStatus.Unconfirmed,
            TransferDirection.Send
        );
        this.logger.debug(`Found ${sends.length} ${TransferStatus.Unconfirmed} sends`);

        for (const send of sends) {
            const transaction = await this.wallet.provider.getTransaction(send.transactionHash);
            const receipt = await transaction.wait();

            await this.handleConfirmation(send, receipt);
        }
    }

    private async handleConfirmation(
        transfer: Transfer,
        { transactionHash, logs, blockNumber }: ContractReceipt
    ) {
        const { id } = transfer;

        const isWithdrawalOrSend = (t: Transfer) =>
            [TransferDirection.Withdrawal, TransferDirection.Send].includes(t.direction);

        const logName = isWithdrawalOrSend(transfer) ? 'TransferSingle' : 'ClaimSingle';

        const hasLog = logs
            .map((log: any) => this.blockchainProperties.registry.interface.parseLog(log))
            .filter((log: any) => log.name === logName)
            .some((log: any) =>
                isWithdrawalOrSend(transfer)
                    ? this.hasMatchingTransferLog(transfer, log)
                    : this.hasMatchingClaimLog(transfer, log)
            );

        if (!hasLog) {
            this.logger.error(
                `[Transfer ${id}] Expected event ${logName} was not found in the transaction ${transactionHash}`
            );
            return this.transferService.setAsError(id);
        }

        return this.transferService.setAsConfirmed(transactionHash, blockNumber);
    }

    private hasMatchingTransferLog(transfer: Transfer, { args }: ethers.utils.LogDescription) {
        const to = String(args.to).toLowerCase();
        const from = String(args.from).toLowerCase();

        return (
            args.id.toString() === transfer.asset.tokenId &&
            from === this.wallet.address.toLowerCase() &&
            to === transfer.address.toLowerCase() &&
            args.value.toString() === transfer.amount
        );
    }

    private hasMatchingClaimLog(transfer: Transfer, { args }: ethers.utils.LogDescription) {
        const to = String(args._claimIssuer).toLowerCase();
        const from = String(args._claimSubject).toLowerCase();

        return (
            args._id.toString() === transfer.asset.tokenId &&
            from === this.wallet.address.toLowerCase() &&
            to === this.wallet.address.toLowerCase() &&
            args._value.toString() === transfer.amount
        );
    }
}
