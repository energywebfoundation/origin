import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Deposit } from './deposit.entity';

@Injectable()
export class DepositService {
    constructor(
        @InjectRepository(Deposit)
        private readonly repository: Repository<Deposit>
    ) {}

    public async getAll(userId: string) {
        return this.repository.find({ where: { userId } });
    }
}
