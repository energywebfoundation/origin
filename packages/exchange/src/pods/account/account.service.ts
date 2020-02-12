import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { AccountBalanceService } from '../account-balance/account-balance.service';
import { AccountDeployerService } from '../account-deployer/account-deployer.service';
import { RequestWithdrawalDTO } from '../transfer/create-withdrawal.dto';
import { TransferService } from '../transfer/transfer.service';
import { Account } from './account';
import { Account as AccountEntity } from './account.entity';

@Injectable()
export class AccountService {
    constructor(
        @Inject(forwardRef(() => AccountBalanceService))
        private readonly accountBalanceService: AccountBalanceService,
        @Inject(forwardRef(() => TransferService))
        private readonly transferService: TransferService,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly accountDeployerService: AccountDeployerService
    ) {}

    public getOrCreateAccount(userId: string, transaction?: EntityManager) {
        if (transaction) {
            return this.create(userId, transaction);
        }

        return this.connection.transaction(tr => this.create(userId, tr));
    }

    private async create(userId: string, transaction: EntityManager) {
        let account = await transaction.findOne<AccountEntity>(AccountEntity, null, {
            where: { userId }
        });
        if (!account) {
            const address = await this.accountDeployerService.deployAccount();

            account = await transaction
                .create<AccountEntity>(AccountEntity, { userId, address })
                .save();
        }

        return account;
    }

    public async findByAddress(address: string, transaction?: EntityManager) {
        const manager = transaction || this.connection.manager;

        return manager.findOne<AccountEntity>(AccountEntity, { where: { address } });
    }

    public async getAccount(userId: string): Promise<Account> {
        const { address } = await this.getOrCreateAccount(userId);

        const balances = await this.accountBalanceService.getAccountBalance(userId);

        return {
            address,
            balances
        };
    }

    public async requestWithdrawal(withdrawal: RequestWithdrawalDTO) {
        const { userId, assetId, amount } = withdrawal;

        const hasEnoughAssetAmount = await this.accountBalanceService.hasEnoughAssetAmount(
            userId,
            assetId,
            amount
        );

        if (!hasEnoughAssetAmount) {
            throw new Error('Not enough assets');
        }

        return this.transferService.requestWithdrawal(withdrawal);
    }
}
