import {
    isRole,
    IUser,
    LoggedInUser,
    OrganizationStatus,
    Role
} from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { FileService } from '../file/file.service';

import { User, UserService } from '../user';
import {
    OrganizationMemberRemovedEvent,
    OrganizationMemberRoleChangedEvent,
    OrganizationNameAlreadyTakenEvent,
    OrganizationRegisteredEvent,
    OrganizationStatusChangedEvent
} from './events';
import { NewOrganizationDTO } from './new-organization.dto';
import { OrganizationDocumentOwnershipMismatchError } from './organization-document-ownership-mismatch.error';
import { OrganizationNameAlreadyTakenError } from './organization-name-taken.error';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationService {
    private readonly logger = new Logger(OrganizationService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly repository: Repository<Organization>,
        private readonly userService: UserService,
        private readonly fileService: FileService,
        private readonly eventBus: EventBus
    ) {}

    async create(
        user: LoggedInUser,
        organizationToRegister: NewOrganizationDTO
    ): Promise<Organization> {
        this.logger.debug(
            `User ${JSON.stringify(user)} requested organization registration ${JSON.stringify(
                organizationToRegister
            )}`
        );

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
            signatoryZipCode,
            signatoryDocumentIds,
            documentIds
        } = organizationToRegister;

        let userInfo = await this.userService.findById(user.id);

        if (await this.isNameAlreadyTaken(name)) {
            this.eventBus.publish(new OrganizationNameAlreadyTakenEvent(name, userInfo));

            throw new OrganizationNameAlreadyTakenError(name);
        }

        const documents = [...(documentIds ?? []), ...(signatoryDocumentIds ?? [])];

        if (!(await this.isDocumentOwner(user, documents))) {
            throw new OrganizationDocumentOwnershipMismatchError();
        }

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
            signatoryDocumentIds,
            documentIds,

            status: OrganizationStatus.Submitted,
            users: [{ id: user.id } as User],
            devices: []
        });

        const stored = await this.repository.save(organizationToCreate);
        userInfo = await this.userService.findById(user.id);

        await this.fileService.updateOrganization(new LoggedInUser(userInfo), documents);

        this.eventBus.publish(new OrganizationRegisteredEvent(stored, userInfo));

        this.logger.debug(
            `User ${JSON.stringify(user)} successfully registered new organization with id ${
                stored.id
            }`
        );

        return stored;
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
        const organization = await this.findOne(id);

        await this.repository.update(id, {
            status
        });

        this.eventBus.publish(
            new OrganizationStatusChangedEvent(organization, status, organization.status)
        );

        return this.findOne(id);
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

        this.eventBus.publish(new OrganizationMemberRemovedEvent(organization, userToBeRemoved));
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

        this.eventBus.publish(
            new OrganizationMemberRoleChangedEvent(
                organization,
                userToBeChanged,
                newRole,
                userToBeChanged.rights as Role
            )
        );
    }

    private async isNameAlreadyTaken(name: string) {
        const existingOrganizations = await this.repository
            .createQueryBuilder()
            .where('LOWER(name) = LOWER(:name)', { name })
            .getCount();

        return existingOrganizations > 0;
    }

    private async isDocumentOwner(user: LoggedInUser, documentIds: string[]) {
        if (!documentIds?.length) {
            return true;
        }

        return this.fileService.isOwner(user, documentIds);
    }
}
