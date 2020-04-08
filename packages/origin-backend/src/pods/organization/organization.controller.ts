import { Repository, FindConditions } from 'typeorm';
import { validate } from 'class-validator';
import {
    OrganizationStatus,
    OrganizationPostData,
    IOrganization,
    IUser,
    OrganizationInvitationStatus,
    OrganizationInviteCreateReturnData,
    IOrganizationInvitation,
    IUserWithRelationsIds,
    OrganizationRemoveMemberReturnData,
    OrganizationStatusChangedEvent,
    SupportedEvents,
    OrganizationInvitationEvent,
    OrganizationRemovedMemberEvent,
    OrganizationUpdateData
} from '@energyweb/origin-backend-core';

import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Post,
    Body,
    BadRequestException,
    UnprocessableEntityException,
    Delete,
    Put,
    UseGuards,
    Query,
    ParseIntPipe,
    Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';

import { Organization } from './organization.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { UserDecorator } from '../user/user.decorator';
import { UserService } from '../user/user.service';
import { OrganizationInvitation } from './organizationInvitation.entity';
import { User } from '../user/user.entity';
import { EventsService } from '../events';
import { OrganizationService } from './organization.service';

@Controller('/Organization')
export class OrganizationController {
    private logger = new Logger(OrganizationController.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationInvitation)
        private readonly organizationInvitationRepository: Repository<OrganizationInvitation>,
        private readonly userService: UserService,
        private readonly eventsService: EventsService,
        private readonly organizationService: OrganizationService
    ) {}

    @Get()
    async getAll() {
        return this.organizationRepository.find();
    }

    @Get('invitation')
    @UseGuards(AuthGuard('jwt'))
    async getInvitations(
        @UserDecorator() loggedUser: IUser,
        @Query('email') emailFromQuery: string,
        @Query('organization') organizationId: string
    ): Promise<IOrganizationInvitation[]> {
        const findConditions: FindConditions<OrganizationInvitation> = {};

        if (emailFromQuery) {
            if (emailFromQuery === loggedUser.email) {
                findConditions.email = loggedUser.email;
            } else {
                throw new BadRequestException(
                    `You can only get invitations received to logged user email.`
                );
            }
        }

        if (organizationId) {
            findConditions.organization = { id: parseInt(organizationId, 10) };
        }

        return (this.organizationInvitationRepository.find({
            where: findConditions,
            loadRelationIds: true
        }) as Promise<Omit<IOrganizationInvitation, 'organization'>[]>) as Promise<
            IOrganizationInvitation[]
        >;
    }

    @Get('/:id/users')
    @UseGuards(AuthGuard('jwt'))
    async getUsers(@Param('id') id: string, @UserDecorator() loggedUser: IUserWithRelationsIds) {
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

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existingEntity = await this.organizationService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async post(@Body() body: any, @UserDecorator() loggedUser: IUser) {
        try {
            const newEntity = new Organization();

            const user = await this.userService.findById(loggedUser.id);

            const data: Omit<IOrganization, 'id'> = {
                ...(body as OrganizationPostData),
                status: OrganizationStatus.Submitted,
                leadUser: user,
                users: [user],
                devices: []
            };

            Object.assign(newEntity, data);

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                throw new UnprocessableEntityException({
                    success: false,
                    errors: validationErrors.map((e) => e?.toString())
                });
            } else {
                await this.organizationRepository.save(newEntity);

                return newEntity;
            }
        } catch (error) {
            console.warn('Error while saving entity');
            console.error(error);

            throw new BadRequestException('Could not save organization.');
        }
    }

    @Delete('/:id')
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

        this.eventsService.handleEvent({
            type: SupportedEvents.ORGANIZATION_STATUS_CHANGED,
            data: eventData
        });

        return {
            message: `Entity ${id} successfully updated`
        };
    }

    @Put('invitation/:invitationId')
    @UseGuards(AuthGuard('jwt'))
    async updateInvitation(
        @Body('status') status: IOrganizationInvitation['status'],
        @Param('invitationId') invitationId: string,
        @UserDecorator() loggedUser: IUser
    ) {
        try {
            const user = await this.userService.findById(loggedUser.id);
            const invitation = await this.organizationInvitationRepository.findOneOrFail(
                invitationId,
                {
                    loadRelationIds: true
                }
            );

            if (invitation.email !== user.email) {
                throw new BadRequestException('Invitation email does not match.');
            }

            if (invitation.status !== OrganizationInvitationStatus.Pending) {
                throw new BadRequestException('Invitation is not in pending state.');
            }

            if (
                ![
                    OrganizationInvitationStatus.Rejected,
                    OrganizationInvitationStatus.Accepted
                ].includes(status)
            ) {
                throw new BadRequestException('Incorrect invitation status value.');
            }

            const organization = await this.organizationRepository.findOneOrFail(
                invitation.organization,
                {
                    relations: ['users']
                }
            );

            ((user as any) as User).organization = organization;
            organization.users.push((user as any) as User);
            invitation.status = status;
            await organization.save();
            await invitation.save();
            await user.save();

            return true;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.warn(
                'Unexpected error while accepting invitation to organization',
                error?.message
            );

            throw new BadRequestException({
                success: false,
                error: 'Could not accept invitation.'
            });
        }
    }

    @Post('invite')
    @UseGuards(AuthGuard('jwt'))
    async invite(
        @Body('email') email: string,
        @UserDecorator() loggedUser: IUser
    ): Promise<OrganizationInviteCreateReturnData> {
        try {
            const user = await this.userService.findById(loggedUser.id);

            if (typeof user.organization === 'undefined') {
                throw new BadRequestException({
                    success: false,
                    error: `User doesn't belong to any organization.`
                });
            }

            const organization = await this.organizationRepository.findOne(user.organization, {
                relations: ['leadUser', 'invitations', 'users']
            });

            if (organization.leadUser.id !== user.id) {
                throw new BadRequestException({
                    success: false,
                    error: `User is not a lead user of organization.`
                });
            }

            if (organization.users.find((u) => u.email === email)) {
                throw new BadRequestException({
                    success: false,
                    error: `Invited user already belongs to this organization.`
                });
            }

            if (organization.invitations.find((u) => u.email === email)) {
                throw new BadRequestException({
                    success: false,
                    error: `User has already been invited to this organization.`
                });
            }

            const invitation = this.organizationInvitationRepository.create({
                email,
                organization,
                status: OrganizationInvitationStatus.Pending
            });

            await invitation.save();

            organization.invitations.push(invitation);

            await organization.save();

            const eventData: OrganizationInvitationEvent = {
                email,
                organizationName: organization.name
            };

            this.eventsService.handleEvent({
                type: SupportedEvents.ORGANIZATION_INVITATION,
                data: eventData
            });

            return {
                success: true,
                error: null
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.warn('Unexpected error while inviting user to organization', error?.message);

            throw new BadRequestException({
                success: false,
                error: 'Could not invite user due to unknown error'
            });
        }
    }

    @Post(':id/remove-member/:userId')
    @UseGuards(AuthGuard('jwt'))
    async removeMember(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('userId', new ParseIntPipe()) removedUserId: number,
        @UserDecorator() loggedUser: IUserWithRelationsIds
    ): Promise<OrganizationRemoveMemberReturnData> {
        try {
            const user = await this.userService.findById(loggedUser.id);

            if (typeof user.organization === 'undefined') {
                throw new BadRequestException({
                    success: false,
                    error: `User doesn't belong to any organization.`
                });
            }

            const organization = await this.organizationRepository.findOne(user.organization, {
                relations: ['leadUser', 'invitations', 'users']
            });

            if (organization.id !== organizationId || organization.leadUser.id !== user.id) {
                throw new BadRequestException({
                    success: false,
                    error: `User is not a lead user of organization.`
                });
            }

            if (organization.leadUser.id === removedUserId) {
                throw new BadRequestException({
                    success: false,
                    error: `Can't remove lead user from organization.`
                });
            }

            if (!organization.users.find((u) => u.id === removedUserId)) {
                throw new BadRequestException({
                    success: false,
                    error: `User to be removed is not part of the organization.`
                });
            }

            const removedUser = organization.users.find((u) => u.id === removedUserId);

            organization.users = organization.users.filter((u) => u.id !== removedUserId);

            await organization.save();

            removedUser.organization = null;

            removedUser.save();

            const eventData: OrganizationRemovedMemberEvent = {
                organizationName: organization.name,
                email: removedUser.email
            };

            this.eventsService.handleEvent({
                type: SupportedEvents.ORGANIZATION_REMOVED_MEMBER,
                data: eventData
            });

            return {
                success: true,
                error: null
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.warn(
                'Unexpected error while removing member from organization',
                error?.message
            );

            throw new BadRequestException({
                success: false,
                error: 'Could not remove member due to unknown error'
            });
        }
    }
}
