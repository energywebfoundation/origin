import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Connection, EntityManager, Repository } from 'typeorm';

import { AccountDeployerService } from '../account-deployer/account-deployer.service';
import { AccountAlreadyExistsError } from './account-already-exists.error';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
    private readonly logger = new Logger(AccountService.name);

    private readonly requestQueue = new Subject<string>();

    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>,
        private readonly connection: Connection,
        private readonly accountDeployerService: AccountDeployerService
    ) {
        this.requestQueue.pipe(concatMap((id) => this.process(id))).subscribe();
    }

    public async create(userId: string) {
        this.logger.debug(`User with userId=${userId} requesting account creation`);

        const account = await this.repository.findOne(null, {
            where: { userId }
        });

        if (account) {
            throw new AccountAlreadyExistsError(userId);
        }

        this.requestQueue.next(userId);
    }

    private async process(userId: string) {
        this.logger.debug(`Processing account creation for user with userId=${userId}`);

        const account = await this.repository.findOne(null, {
            where: { userId }
        });

        if (account) {
            this.logger.error(
                `Account for user with userId=${userId} has already been deployed. Skipping.`
            );

            return;
        }

        const address = await this.accountDeployerService.deployAccount();

        await this.repository.save({ userId, address });

        this.logger.debug(`Account deployed ${JSON.stringify(account)} `);
    }

    public async findByAddress(address: string, transaction?: EntityManager) {
        this.logger.debug(`Requesting account for address ${address}`);
        const manager = transaction || this.connection.manager;
        const repository = manager.getRepository<Account>(Account);

        const account = await repository.findOne({
            where: { address }
        });

        this.logger.debug(`Returning ${JSON.stringify(account)}`);
        return account;
    }

    public async getAccount(userId: string): Promise<Account> {
        return this.repository.findOne(null, {
            where: { userId }
        });
    }
}
