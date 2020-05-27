import {
    ILoggedInUser,
    IOrganizationInvitation,
    isRole,
    OrganizationInviteCreateReturnData,
    OrganizationPostData,
    OrganizationRemoveMemberReturnData,
    OrganizationStatusChangedEvent,
    OrganizationUpdateData,
    Role,
    SupportedEvents
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    forwardRef,
    Get,
    Inject,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UnprocessableEntityException,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageErrors } from '../../enums/StorageErrors';
import { NotificationService } from '../notification';
import { OrganizationInvitationService } from './organization-invitation.service';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';
import { OrganizationInvitation } from './organizationInvitation.entity';

@Controller('/Organization')
export class OrganizationController {
    private logger = new Logger(OrganizationController.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationInvitation)
        private readonly organizationInvitationRepository: Repository<OrganizationInvitation>,
        @Inject(forwardRef(() => OrganizationService))
        private readonly organizationService: OrganizationService,
        private readonly notificationService: NotificationService,
        private readonly organizationInvitationService: OrganizationInvitationService
    ) {}

    @Get()
    async getAll() {
        return this.organizationRepository.find();
    }

    @Get('/invitation')
    @UseGuards(AuthGuard())
    async getInvitations(
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<IOrganizationInvitation[]> {
        return (this.organizationInvitationRepository.find({
            where: { email: loggedUser.email },
            loadRelationIds: true
        }) as Promise<Omit<IOrganizationInvitation, 'organization'>[]>) as Promise<
            IOrganizationInvitation[]
        >;
    }

    @Get('/:id/users')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin, Role.SupportAgent)
    async getUsers(@Param('id') id: string, @UserDecorator() loggedUser: ILoggedInUser) {
        const organization = await this.organizationRepository.findOne(id, {
            relations: ['users', 'leadUser']
        });

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (loggedUser.id !== organization.leadUser.id) {
            throw new BadRequestException('Only lead user can view other organization members.');
        }

        return organization.users;
    }

    @Get('/:id/devices')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Admin, Role.SupportAgent)
    async getDevices(@Param('id') id: string, @UserDecorator() loggedUser: ILoggedInUser) {
        if (!isRole(loggedUser, Role.OrganizationDeviceManager)) {
            throw new ForbiddenException();
        }

        const organization = await this.organizationRepository.findOne(id, {
            relations: ['devices'],
            where: { id: loggedUser.organizationId }
        });

        return organization.devices;
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existingEntity = await this.organizationService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    @UseGuards(AuthGuard())
    async post(@Body() body: OrganizationPostData, @UserDecorator() loggedUser: ILoggedInUser) {
        try {
            const organization = this.organizationService.create(loggedUser.id, body);

            return organization;
        } catch (error) {
            console.warn('Error while saving entity');
            console.error(error);

            throw new BadRequestException('Could not save organization.');
        }
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.Admin)
    async delete(@Param('id') id: string) {
        const existingEntity = await this.organizationService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.organizationService.remove(existingEntity);

        return {
            message: `Entity ${id} deleted`
        };
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.Admin)
    async put(@Param('id') id: string, @Body() body: OrganizationUpdateData) {
        const existingEntity = await this.organizationService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (existingEntity.status === body.status) {
            throw new BadRequestException(`Organization is already in requested status.`);
        }

        try {
            await this.organizationService.update(id, body);
        } catch (error) {
            this.logger.error(error);
            throw new UnprocessableEntityException({
                message: `Entity ${id} could not be updated due to an unkown error`
            });
        }

        const eventData: OrganizationStatusChangedEvent = {
            organizationId: existingEntity.id,
            organizationEmail: existingEntity.email,
            status: body.status
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_STATUS_CHANGED,
            data: eventData
        });

        return {
            message: `Entity ${id} successfully updated`
        };
    }

    @Get('/:id/invitations')
    @UseGuards(AuthGuard())
    async getInvitationsForOrganization(
        @Param('id') organizationId: string
    ): Promise<IOrganizationInvitation[]> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return (this.organizationInvitationRepository.find({
            where: { organization: organizationId },
            loadRelationIds: true
        }) as Promise<Omit<IOrganizationInvitation, 'organization'>[]>) as Promise<
            IOrganizationInvitation[]
        >;
    }

    @Put('/invitation/:invitationId')
    @UseGuards(AuthGuard())
    async updateInvitation(
        @Body('status') status: IOrganizationInvitation['status'],
        @Param('invitationId') invitationId: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        await this.organizationInvitationService.acceptOrReject(loggedUser, invitationId, status);
        return true;
    }

    @Post('/invite')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    async invite(
        @Body('email') email: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<OrganizationInviteCreateReturnData> {
        await this.organizationInvitationService.invite(loggedUser, email);

        return {
            success: true,
            error: null
        };
    }

    @Post(':id/remove-member/:userId')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    async removeMember(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('userId', new ParseIntPipe()) memberId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<OrganizationRemoveMemberReturnData> {
        await this.organizationService.removeMember(loggedUser, organizationId, memberId);

        return {
            success: true,
            error: null
        };
    }
}
