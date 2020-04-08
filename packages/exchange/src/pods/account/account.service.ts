import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { AccountBalanceService } from '../account-balance/account-balance.service';
import { AccountDeployerService } from '../account-deployer/account-deployer.service';
import { Account } from './account';
import { Account as AccountEntity } from './account.entity';

@Injectable()
export class AccountService {
    private readonly logger = new Logger(AccountService.name);

    constructor(
        @Inject(forwardRef(() => AccountBalanceService))
        private readonly accountBalanceService: AccountBalanceService,
        @InjectConnection('ExchangeConnection')
        private readonly connection: Connection,
        private readonly accountDeployerService: AccountDeployerService
    ) {}

    public getOrCreateAccount(userId: string, transaction?: EntityManager) {
        if (transaction) {
            return this.create(userId, transaction);
        }

        return this.connection.transaction((tr) => this.create(userId, tr));
    }

    private async create(userId: string, transaction: EntityManager) {
        this.logger.debug(`Trying to find account for userId=${userId}`);
        const repository = transaction.getRepository<AccountEntity>(AccountEntity);

        let account = await repository.findOne(null, {
            where: { userId }
        });
        if (!account) {
            this.logger.debug(`Account for userId=${userId} not found. Creating.`);
            const address = await this.accountDeployerService.deployAccount();

            account = await repository.save({ userId, address });
        }

        this.logger.debug(`Returning account ${JSON.stringify(account)} `);

        return account;
    }

    public async findByAddress(address: string, transaction?: EntityManager) {
        this.logger.debug(`Requesting account for address ${address}`);
        const manager = transaction || this.connection.manager;
        const repository = manager.getRepository<AccountEntity>(AccountEntity);

        const account = await repository.findOne({
            where: { address }
        });

        this.logger.debug(`Returning ${JSON.stringify(account)}`);
        return account;
    }

    public async getAccount(userId: string): Promise<Account> {
        const { address } = await this.getOrCreateAccount(userId);

        const balances = await this.accountBalanceService.getAccountBalance(userId);

        return new Account({
            address,
            balances
        });
    }
}
