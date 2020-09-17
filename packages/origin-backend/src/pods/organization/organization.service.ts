import {
    isRole,
    IUser,
    OrganizationMemberChangedRoleEvent,
    OrganizationRemovedMemberEvent,
    OrganizationStatus,
    OrganizationStatusChangedEvent,
    Role,
    SupportedEvents
} from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { NotificationService } from '../notification';
import { User, UserService } from '../user';
import { NewOrganizationDTO } from './new-organization.dto';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private readonly repository: Repository<Organization>,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService
    ) {}

    async create(
        userId: number,
        organizationToRegister: NewOrganizationDTO
    ): Promise<Organization> {
        const {
            name,
            address,
            businessType,
            city,
            zipCode,
            country,
            tradeRegistryCompanyNumber,
            vatNumber,
            signatoryAddress,
            signatoryCity,
            signatoryCountry,
            signatoryEmail,
            signatoryFullName,
            signatoryPhoneNumber,
            signatoryZipCode
        } = organizationToRegister;

        const organizationToCreate = new Organization({
            name,
            address,
            businessType,
            city,
            zipCode,
            country,
            tradeRegistryCompanyNumber,
            vatNumber,
            signatoryAddress,
            signatoryCity,
            signatoryCountry,
            signatoryEmail,
            signatoryFullName,
            signatoryPhoneNumber,
            signatoryZipCode,

            status: OrganizationStatus.Submitted,
            users: [{ id: userId } as User],
            devices: []
        });

        return this.repository.save(organizationToCreate);
    }

    async findOne(
        id: string | number,
        options: FindOneOptions<Organization> = {}
    ): Promise<Organization> {
        return this.repository.findOne(id, {
            ...options
        });
    }

    async getAll(): Promise<Organization[]> {
        return this.repository.find();
    }

    async remove(organizationId: number): Promise<void> {
        await this.repository.delete(organizationId);
    }

    async getDeviceManagers(id: number): Promise<IUser[]> {
        const members = await this.getMembers(id);

        return members.filter((u) => isRole(u, Role.OrganizationDeviceManager));
    }

    async getMembers(id: number): Promise<IUser[]> {
        const organization = await this.findOne(id);

        return organization.users;
    }

    async update(id: number, status: OrganizationStatus): Promise<Organization> {
        await this.repository.update(id, {
            status
        });

        const organization = await this.findOne(id);

        const eventData: OrganizationStatusChangedEvent = {
            organizationId: organization.id,
            organizationEmail: organization.signatoryEmail,
            status
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_STATUS_CHANGED,
            data: eventData
        });

        return organization;
    }

    async hasDevice(id: number, deviceId: string): Promise<boolean> {
        const devicesCount = await this.repository
            .createQueryBuilder('organization')
            .leftJoinAndSelect('organization.devices', 'device')
            .where('device.id = :deviceId AND organization.id = :id', { id, deviceId })
            .getCount();

        return devicesCount === 1;
    }

    async removeMember(organizationId: number, memberId: number): Promise<void> {
        const organization = await this.findOne(organizationId);

        if (!organization.users.find((u) => u.id === memberId)) {
            throw new BadRequestException({
                success: false,
                message: `User to be removed is not part of the organization.`
            });
        }

        const admins = organization.users.filter((u) => isRole(u, Role.OrganizationAdmin));
        const userToBeRemoved = await this.userService.findById(memberId);

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

        await this.userService.removeFromOrganization(memberId);
        await this.userService.changeRole(memberId, Role.OrganizationAdmin);

        const eventData: OrganizationRemovedMemberEvent = {
            organizationName: organization.name,
            email: userToBeRemoved.email
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_REMOVED_MEMBER,
            data: eventData
        });
    }

    async changeMemberRole(organizationId: number, memberId: number, newRole: Role): Promise<void> {
        const organization = await this.findOne(organizationId);

        if (!organization.users.find((u) => u.id === memberId)) {
            throw new BadRequestException({
                success: false,
                message: `User to be removed is not part of the organization.`
            });
        }

        const userToBeChanged = await this.userService.findById(memberId);
        const admins = organization.users.filter((u) => isRole(u, Role.OrganizationAdmin));

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
