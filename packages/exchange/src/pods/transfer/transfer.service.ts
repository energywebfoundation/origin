import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';

import { Transfer } from './transfer.entity';
import { TransferDirection } from './transfer-direction';
import { CreateDepositDTO } from './create-deposit.dto';
import { AssetService } from '../asset/asset.service';
import { Asset } from '../asset/asset.entity';
import { AccountService } from '../account/account.service';

@Injectable()
export class TransferService {
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

    public async createDeposit(depositDTO: CreateDepositDTO) {
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

            return manager
                .getRepository<Transfer>(Transfer)
                .create(deposit)
                .save();
        });
    }
}
