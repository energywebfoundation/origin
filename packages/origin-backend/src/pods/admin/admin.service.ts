import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>
    ) {}

    public async getAllUsers() {
        return this.repository.find({
            relations: ['organization']
        });
    }
}
