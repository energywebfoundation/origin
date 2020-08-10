import { Injectable, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import {
    IOrganization,
    IOrganizationWithRelationsIds,
    isRole,
    Role,
    OrganizationUpdateData,
    OrganizationPostData,
    OrganizationStatus,
    ILoggedInUser,
    OrganizationRemovedMemberEvent,
    SupportedEvents,
    OrganizationMemberChangedRoleEvent,
    IUser
} from '@energyweb/origin-backend-core';
import { validate } from 'class-validator';
import { Organization } from './organization.entity';
import { UserService, User } from '../user';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { NotificationService } from '../notification';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private readonly repository: Repository<Organization>,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService
    ) {}

    async create(userId: number, data: OrganizationPostData) {
        const organizationToCreate = new Organization({
            activeCountries: data.activeCountries,
            code: data.code,
            name: data.name,
            contact: data.contact,
            telephone: data.telephone,
            email: data.email,
            address: data.address,
            shareholders: data.shareholders,
            ceoPassportNumber: data.ceoPassportNumber,
            ceoName: data.ceoName,
            companyNumber: data.companyNumber,
            vatNumber: data.vatNumber,
            postcode: data.postcode,
            headquartersCountry: data.headquartersCountry,
            country: data.country,
            businessTypeSelect: data.businessTypeSelect,
            businessTypeInput: data.businessTypeInput,
            yearOfRegistration: data.yearOfRegistration,
            numberOfEmployees: data.numberOfEmployees,
            website: data.website,

            status: OrganizationStatus.Submitted,
            users: [{ id: userId } as User],
            devices: []
        });

        const validationErrors = await validate(organizationToCreate);

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors.map((e) => e?.toString())
            });
        }

        return this.repository.save(organizationToCreate);
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

    async getDeviceManagers(id: string | number): Promise<IUser[]> {
        const members = await this.getMembers(id);

        return members.filter((u) => isRole(u, Role.OrganizationDeviceManager));
    }

    async getAdmins(id: string | number): Promise<IUser[]> {
        const members = await this.getMembers(id);

        return members.filter((u) => isRole(u, Role.OrganizationAdmin));
    }

    async getMembers(id: string | number): Promise<IUser[]> {
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

    async removeMember(user: ILoggedInUser, organizationId: number, memberId: number) {
        if (organizationId !== user.organizationId) {
            throw new BadRequestException({
                success: false,
                message: `You are not in the requested organization.`
            });
        }

        const organization = await this.repository.findOne(user.organizationId, {
            relations: ['users']
        });

        const userToBeRemoved = await this.userService.findById(memberId);
        const admins = await this.getAdmins(organizationId);

        if (isRole(userToBeRemoved, Role.OrganizationAdmin) && admins.length < 2) {
            throw new BadRequestException({
                success: false,
                message: `Can't remove admin user from organization. There always has to be at least one admin in the organization.`
            });
        }

        if (!organization.users.find((u) => u.id === memberId)) {
            throw new BadRequestException({
                success: false,
                message: `User to be removed is not part of the organization.`
            });
        }

        await this.userService.removeOrganization(memberId);

        const eventData: OrganizationRemovedMemberEvent = {
            organizationName: organization.name,
            email: userToBeRemoved.email
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_REMOVED_MEMBER,
            data: eventData
        });
    }

    async changeMemberRole(
        user: ILoggedInUser,
        organizationId: number,
        memberId: number,
        newRole: Role
    ) {
        if (organizationId !== user.organizationId) {
            throw new BadRequestException({
                success: false,
                message: `You are not in the requested organization.`
            });
        }

        const userToBeChanged = await this.userService.findById(memberId);
        const admins = await this.getAdmins(organizationId);

        if (
            newRole !== Role.OrganizationAdmin &&
            isRole(userToBeChanged, Role.OrganizationAdmin) &&
            admins.length < 2
        ) {
            throw new BadRequestException({
                success: false,
                message: `Can't change role of admin user from organization. There always has to be at least one admin in the organization.`
            });
        }

        const organization = await this.repository.findOne(user.organizationId, {
            relations: ['users']
        });

        if (!organization.users.find((u) => u.id === memberId)) {
            throw new BadRequestException({
                success: false,
                message: `User to be removed is not part of the organization.`
            });
        }

        await this.userService.changeRole(memberId, newRole);

        const eventData: OrganizationMemberChangedRoleEvent = {
            organizationName: organization.name,
            newRole,
            email: userToBeChanged.email
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_MEMBER_CHANGED_ROLE,
            data: eventData
        });
    }
}
