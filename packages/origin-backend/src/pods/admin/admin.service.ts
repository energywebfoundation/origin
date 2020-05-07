import { IUser, KYCStatus, Status } from '@energyweb/origin-backend-core';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
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

    public async getUsersBy(orgName: string, status: Status, kycStatus: KYCStatus) {
        const _orgName = `%${orgName}%`;
        const result = await this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .where(
                'organization.name ilike :_orgName and user.status = :status and user.kycStatus = :kycStatus',
                { _orgName, status, kycStatus }
            )
            .getMany();
        return result;
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
