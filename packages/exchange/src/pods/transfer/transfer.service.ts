import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transfer } from './transfer.entity';
import { TransferDirection } from './transfer-direction';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(Transfer)
        private readonly repository: Repository<Transfer>
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

    public async create(transfer: Omit<Transfer, 'id'>) {
        return this.repository.create({ ...transfer, confirmed: false }).save();
    }
}
