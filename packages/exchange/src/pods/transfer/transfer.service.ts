import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, EntityManager } from 'typeorm';

import { Transfer } from './transfer.entity';
import { TransferDirection } from './transfer-direction';
import { CreateDepositDTO } from './create-deposit.dto';
import { AssetService } from '../asset/asset.service';
import { Asset } from '../asset/asset.entity';
import { AccountService } from '../account/account.service';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';

@Injectable()
export class TransferService {
    private readonly logger = new Logger(TransferService.name);

    constructor(
        @InjectRepository(Transfer)
        private readonly repository: Repository<Transfer>,
        private readonly assetService: AssetService,
        @Inject(forwardRef(() => AccountService))
        private readonly accountService: AccountService,
        @InjectConnection()
        private readonly connection: Connection
    ) {}

    public async getAll(userId: string) {
        return this.repository.find({ where: { userId } });
    }

    public async getAllCompleted(userId: string) {
        return this.repository.find({
            where: [
                { userId, direction: TransferDirection.Deposit, confirmed: true },
                { userId, direction: TransferDirection.Withdrawal }
            ]
        });
    }

    public async requestWithdrawal(
        withdrawalDTO: RequestWithdrawalDTO,
        transaction?: EntityManager
    ) {
        const withdrawal: Partial<Transfer> = {
            ...withdrawalDTO,
            asset: { id: withdrawalDTO.assetId } as Asset,
            confirmed: false,
            direction: TransferDirection.Withdrawal
        };

        const manager = transaction || this.repository.manager;

        return manager.transaction(tr => tr.create<Transfer>(Transfer, withdrawal).save());
    }

    public async createDeposit(depositDTO: CreateDepositDTO) {
        this.logger.debug(`Requested deposit creation for ${JSON.stringify(depositDTO)}`);

        return this.connection.transaction<Transfer>(async manager => {
            const { id } = await this.assetService.createIfNotExist(depositDTO.asset, manager);
            const { userId } = await this.accountService.findByAddress(depositDTO.address);

            // TODO: not registered user deposit

            const deposit: Partial<Transfer> = {
                ...depositDTO,
                asset: { id } as Asset,
                confirmed: false,
                direction: TransferDirection.Deposit,
                userId
            };

            this.logger.debug(`Storing deposit ${JSON.stringify(deposit)}`);

            return manager
                .getRepository<Transfer>(Transfer)
                .create(deposit)
                .save();
        });
    }

    public async confirmTransfer(transactionHash: string, blockNumber: number) {
        this.logger.debug(
            `Requested transaction ${transactionHash} confirmation on block ${blockNumber}`
        );
        return this.repository.update(
            { transactionHash },
            { confirmed: true, confirmationBlock: blockNumber }
        );
    }

    public async updateTransactionHash(id: string, transactionHash: string) {
        return this.repository.update({ id }, { transactionHash });
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
