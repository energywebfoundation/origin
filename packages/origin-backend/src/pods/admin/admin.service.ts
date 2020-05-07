import { IUser, IOrganization } from '@energyweb/origin-backend-core';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
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

    public async getUsersBy(orgName: string, status: number, kycStatus: number) {
        const result = await this.repository.find({
            where: { status, kycStatus },
            relations: ['organization']
        });
        return result.filter((item) => {
            const organization = item.organization as IOrganization;
            return organization.name.toLocaleLowerCase().includes(orgName.toLocaleLowerCase());
        });
    }

    async update(id: number | string, data: IUser): Promise<ExtendedBaseEntity & IUser> {
        const entity = await this.repository.findOne(id);

        if (!entity) {
            throw new Error(`Can't find entity.`);
        }

        const updateEntity = new User();

        Object.assign(updateEntity, {
            ...entity,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            telephone: data.telephone,
            email: data.email,
            status: data.status,
            kycStatus: data.kycStatus
        });

        const validationErrors = await validate(updateEntity, {
            skipUndefinedProperties: true
        });
        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        }
        await this.repository.save(updateEntity);

        return this.repository.findOne(id);
    }
}
