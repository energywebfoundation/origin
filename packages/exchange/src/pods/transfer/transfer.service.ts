import { Injectable, Logger } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { Connection, EntityManager, FindOneOptions, Repository } from 'typeorm';

import { AccountService } from '../account/account.service';
import { Asset } from '../asset/asset.entity';
import { AssetService } from '../asset/asset.service';
import { HasEnoughAssetAmountQuery } from '../order/queries/has-enough-asset-amount.query';
import { CreateDepositDTO } from './create-deposit.dto';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';
import { Transfer } from './transfer.entity';
import { WithdrawalRequestedEvent } from './withdrawal-requested.event';

@Injectable()
export class TransferService {
    private readonly logger = new Logger(TransferService.name);

    constructor(
        @InjectRepository(Transfer)
        private readonly repository: Repository<Transfer>,
        private readonly assetService: AssetService,
        private readonly accountService: AccountService,
        private readonly connection: Connection,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus
    ) {}

    public async getAll(userId: string) {
        return this.repository.find({ where: { userId } });
    }

    public async getAllCompleted(userId: string) {
        return this.repository.find({
            where: [
                { userId, direction: TransferDirection.Deposit, status: TransferStatus.Confirmed },
                { userId, direction: TransferDirection.Withdrawal }
            ]
        });
    }

    public async findOne(id?: string, findOptions?: FindOneOptions<Transfer>) {
        return this.repository.findOne(id, findOptions);
    }

    public async getByStatus(status: TransferStatus, direction: TransferDirection) {
        return this.repository.find({ where: { status, direction } });
    }

    public async requestWithdrawal(
        userId: string,
        withdrawalDTO: RequestWithdrawalDTO,
        transaction?: EntityManager
    ) {
        const hasEnoughFunds = await this.queryBus.execute(
            new HasEnoughAssetAmountQuery(userId, [
                {
                    id: withdrawalDTO.assetId,
                    amount: new BN(withdrawalDTO.amount)
                }
            ])
        );

        if (!hasEnoughFunds) {
            throw new Error('Not enough funds');
        }

        const withdrawal: Partial<Transfer> = {
            userId,
            amount: withdrawalDTO.amount,
            address: withdrawalDTO.address,
            asset: { id: withdrawalDTO.assetId } as Asset,
            status: TransferStatus.Accepted,
            direction: TransferDirection.Withdrawal
        };

        const manager = transaction || this.repository.manager;

        try {
            const storedWithdrawal = await manager.transaction((tr) =>
                tr.getRepository<Transfer>(Transfer).save(withdrawal)
            );

            this.logger.debug(`Created new withdrawal with id=${storedWithdrawal.id}`);

            this.eventBus.publish(new WithdrawalRequestedEvent(storedWithdrawal));

            return storedWithdrawal.id;
        } catch (error) {
            this.logger.error(error.message);

            throw error;
        }
    }

    public async createDeposit(depositDTO: CreateDepositDTO) {
        this.logger.debug(`Requested deposit creation for ${JSON.stringify(depositDTO)}`);

        return this.connection.transaction<Transfer>(async (manager) => {
            const { id } = await this.assetService.createIfNotExist(depositDTO.asset, manager);
            const { userId } = await this.accountService.findByAddress(depositDTO.address);

            // TODO: not registered user deposit

            const deposit: Partial<Transfer> = {
                ...depositDTO,
                asset: { id } as Asset,
                status: TransferStatus.Unconfirmed,
                direction: TransferDirection.Deposit,
                userId
            };

            this.logger.debug(`Storing deposit ${JSON.stringify(deposit)}`);

            return manager.getRepository<Transfer>(Transfer).save(deposit);
        });
    }

    public async setAsConfirmed(transactionHash: string, blockNumber: number) {
        this.logger.debug(
            `Requested transaction ${transactionHash} confirmation on block ${blockNumber}`
        );
        return this.repository.update(
            { transactionHash },
            { status: TransferStatus.Confirmed, confirmationBlock: blockNumber }
        );
    }

    public async setAsUnconfirmed(id: string, transactionHash: string) {
        return this.repository.update(
            { id },
            { transactionHash, status: TransferStatus.Unconfirmed }
        );
    }

    public async setAsError(id: string) {
        return this.repository.update({ id }, { status: TransferStatus.Error });
    }

    public async getLastConfirmationBlock() {
        this.logger.debug('Requested last confirmation block from transfers');
        const [transfer] = await this.repository.find({
            take: 1,
            order: { confirmationBlock: 'DESC' },
            where: { direction: TransferDirection.Deposit }
        });

        const blockNumber = transfer?.confirmationBlock || 0;

        this.logger.debug(`Last known confirmation block is ${blockNumber}`);

        return blockNumber;
    }
}
