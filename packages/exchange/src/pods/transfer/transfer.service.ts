import { Injectable, Logger } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { Connection, EntityManager, FindOneOptions, Repository } from 'typeorm';

import { AccountService } from '../account/account.service';
import { Asset } from '../asset/asset.entity';
import { AssetService } from '../asset/asset.service';
import { HasEnoughAssetAmountQuery } from '../order/queries/has-enough-asset-amount.query';
import { CreateDepositDTO } from './dto/create-deposit.dto';
import { RequestWithdrawalDTO } from './dto/create-withdrawal.dto';
import { DepositApprovedEvent } from './deposit-approved.event';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';
import { Transfer } from './transfer.entity';
import { WithdrawalRequestedEvent } from './events/withdrawal-requested.event';
import { RequestClaimDTO } from './dto/request-claim.dto';
import { ClaimRequestedEvent } from './events/claim-requested.event';

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
        { assetId, amount, address }: RequestWithdrawalDTO,
        transaction?: EntityManager
    ): Promise<Transfer['id']> {
        await this.validateEnoughFunds(userId, assetId, amount);

        const withdrawal: Partial<Transfer> = {
            userId,
            amount,
            address,
            asset: { id: assetId } as Asset,
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

    public async requestClaim(
        userId: string,
        { amount, assetId, address }: RequestClaimDTO,
        transaction?: EntityManager
    ): Promise<Transfer['id']> {
        await this.validateEnoughFunds(userId, assetId, amount);

        const claim: Partial<Transfer> = {
            userId,
            amount,
            address,
            asset: { id: assetId } as Asset,
            status: TransferStatus.Accepted,
            direction: TransferDirection.Claim
        };

        const manager = transaction || this.repository.manager;

        try {
            const storedClaim = await manager.transaction((tr) =>
                tr.getRepository<Transfer>(Transfer).save(claim)
            );

            this.logger.debug(`Created new claim with id=${storedClaim.id}`);

            this.eventBus.publish(new ClaimRequestedEvent(storedClaim));

            return storedClaim.id;
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

    public async storeDeposit(deposit: CreateDepositDTO): Promise<void> {
        try {
            const { transactionHash, address, amount, asset, blockNumber } = deposit;

            let transfer = await this.findOne(null, {
                where: { transactionHash }
            });

            if (transfer) {
                this.logger.debug(
                    `Deposit with transactionHash ${transactionHash} already exists and has status ${
                        TransferStatus[transfer.status]
                    } `
                );
                return;
            }

            transfer = await this.createDeposit({
                transactionHash,
                address,
                amount,
                blockNumber,
                asset
            });

            await this.setAsConfirmed(transactionHash, blockNumber);
            this.logger.debug(
                `Successfully created deposit of tokenId=${asset.tokenId} from=${address} with value=${amount} for user=${transfer.userId} `
            );

            this.eventBus.publish(
                new DepositApprovedEvent(asset.deviceId, address, amount, transfer.asset.id)
            );
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    private async validateEnoughFunds(
        userId: string,
        assetId: string,
        amount: string
    ): Promise<void> {
        const hasEnoughFunds = await this.queryBus.execute(
            new HasEnoughAssetAmountQuery(userId, [{ id: assetId, amount: new BN(amount) }])
        );

        if (!hasEnoughFunds) {
            throw new Error('Not enough funds');
        }
    }
}
