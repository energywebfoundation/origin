import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { IUser } from '@energyweb/origin-backend-core';
import { ConfigService } from '@nestjs/config';

import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        private readonly config: ConfigService
    ) {}

    create(data: Omit<IUser, 'id'>): Promise<User> {
        return this.repository
            .create({
                ...data,
                password: this.hashPassword(data.password)
            })
            .save();
    }

    async findByEmail(email: string): Promise<User> {
        return this.repository.findOne({ email });
    }

    hashPassword(password: string) {
        return bcrypt.hashSync(password, this.config.get<number>('PASSWORD_HASH_COST'));
    }
}
