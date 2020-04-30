import { IUser } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
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

    async update(id: number | string, data: IUser): Promise<ExtendedBaseEntity & IUser> {
        const entity = await this.repository.findOne(id);

        if (!entity) {
            throw new Error(`Can't find entity.`);
        }

        await this.repository.update(id, {
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            telephone: data.telephone,
            email: data.email,
            status: data.status,
            kycStatus: data.kycStatus
        });

        return this.repository.findOne(id);
    }
}
