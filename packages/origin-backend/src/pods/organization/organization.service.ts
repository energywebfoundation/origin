import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import {
    IOrganization,
    IOrganizationWithRelationsIds,
    IUserWithRelationsIds,
    isRole,
    Role,
    OrganizationUpdateData
} from '@energyweb/origin-backend-core';
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

    async remove(entity: Organization | (ExtendedBaseEntity & IOrganizationWithRelationsIds)) {
        return this.repository.remove((entity as IOrganization) as Organization);
    }

    async getDeviceManagers(id: string | number): Promise<IUserWithRelationsIds[]> {
        const organization = await this.findOne(id);
        const members = await this.getMembers(id);

        return members.filter(u => u.id === organization.leadUser || isRole(u, Role.DeviceManager));
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
}
