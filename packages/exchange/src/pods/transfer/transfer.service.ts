import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transfer } from './transfer.entity';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(Transfer)
        private readonly repository: Repository<Transfer>
    ) {}

    public async getAll(userId: string, confirmed = true) {
        return this.repository.find({ where: { userId, confirmed } });
    }
}
