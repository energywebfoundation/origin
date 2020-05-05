import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import {
    IOrganization,
    IOrganizationWithRelationsIds,
    IUserWithRelationsIds,
    isRole,
    Role,
    OrganizationUpdateData,
    OrganizationPostData,
    OrganizationStatus
} from '@energyweb/origin-backend-core';
import { validate } from 'class-validator';
import { Organization } from './organization.entity';
import { UserService } from '../user';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private readonly repository: Repository<Organization>,
        private readonly userService: UserService
    ) {}

    async create(userId: number, data: OrganizationPostData) {
        const newEntity = new Organization();

        const user = await this.userService.findById(userId);

        const newOrganization: Omit<IOrganization, 'id'> = {
            ...data,
            status: OrganizationStatus.Submitted,
            leadUser: user,
            users: [user],
            devices: []
        };

        Object.assign(newEntity, newOrganization);

        const validationErrors = await validate(newEntity);

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors.map((e) => e?.toString())
            });
        } else {
            await this.repository.save(newEntity);

            return newEntity;
        }
    }

    async findOne(
        id: string | number,
        options: FindOneOptions<Organization> = {}
    ): Promise<ExtendedBaseEntity & IOrganizationWithRelationsIds> {
        const entity = ((await this.repository.findOne(id, {
            loadRelationIds: true,
            ...options
        })) as IOrganization) as ExtendedBaseEntity & IOrganizationWithRelationsIds;

        return entity;
    }

    async getAll() {
        return this.repository.find();
    }

    async remove(entity: Organization | (ExtendedBaseEntity & IOrganizationWithRelationsIds)) {
        return this.repository.remove((entity as IOrganization) as Organization);
    }

    async getDeviceManagers(id: string | number): Promise<IUserWithRelationsIds[]> {
        const organization = await this.findOne(id);
        const members = await this.getMembers(id);

        return members.filter(
            (u) => u.id === organization.leadUser || isRole(u, Role.OrganizationDeviceManager)
        );
    }

    async getMembers(id: string | number): Promise<IUserWithRelationsIds[]> {
        const organization = await this.findOne(id);

        return this.userService.findByIds(organization.users);
    }

    async update(
        id: number | string,
        data: OrganizationUpdateData
    ): Promise<ExtendedBaseEntity & IOrganizationWithRelationsIds> {
        const entity = await this.findOne(id);

        if (!entity) {
            throw new Error(`Can't find entity.`);
        }

        if (typeof data.status === 'undefined') {
            throw new Error('Nothing to update');
        }

        await this.repository.update(id, {
            status: data.status
        });

        return this.findOne(id);
    }

    async hasDevice(id: number, deviceId: string) {
        const devicesCount = await this.repository
            .createQueryBuilder('organization')
            .leftJoinAndSelect('organization.devices', 'device')
            .where('device.id = :deviceId AND organization.id = :id', { id, deviceId })
            .getCount();

        return devicesCount === 1;
    }
}
