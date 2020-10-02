import {
    ensureOrganizationRole,
    ILoggedInUser,
    IOrganizationUpdateMemberRole,
    isRole,
    ISuccessResponse,
    OrganizationUpdateData,
    Role
} from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UnprocessableEntityException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import { Device } from '../device/device.entity';
import { User } from '../user';
import { NewOrganizationDTO } from './new-organization.dto';
import { OrganizationInvitationDTO } from './organization-invitation.dto';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';
import { FullOrganizationInfoDTO } from './full-organization-info.dto';
import { PublicOrganizationInfoDTO } from './public-organization-info.dto';
import { OrganizationNameAlreadyTakenError } from './organization-name-taken.error';
import { OrganizationDocumentOwnershipMismatchError } from './organization-document-ownership-mismatch.error';

@Controller('/Organization')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class OrganizationController {
    private logger = new Logger(OrganizationController.name);

    constructor(private readonly organizationService: OrganizationService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    async getAll(): Promise<FullOrganizationInfoDTO[]> {
        const organizations = await this.organizationService.getAll();

        return organizations.map((org) => FullOrganizationInfoDTO.fromPlatformOrganization(org));
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async get(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<FullOrganizationInfoDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return FullOrganizationInfoDTO.fromPlatformOrganization(organization);
    }

    @Get('/:id/public')
    @UseGuards(AuthGuard())
    async getPublic(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<PublicOrganizationInfoDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        return PublicOrganizationInfoDTO.fromPlatformOrganization(organization);
    }

    @Get('/:id/invitations')
    @UseGuards(AuthGuard())
    async getInvitationsForOrganization(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<OrganizationInvitationDTO[]> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return organization?.invitations?.map((inv) =>
            OrganizationInvitationDTO.fromInvitation(inv)
        );
    }

    @Get('/:id/users')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin, Role.SupportAgent)
    async getUsers(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<User[]> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return organization?.users;
    }

    @Get('/:id/devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Admin, Role.SupportAgent)
    async getDevices(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<Device[]> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return organization?.devices;
    }

    @Post()
    @UseGuards(AuthGuard())
    @Roles(Role.OrganizationAdmin)
    async register(
        @Body() organizationToRegister: NewOrganizationDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<Organization> {
        if (loggedUser.hasOrganization) {
            throw new ForbiddenException('User is already part of an organization');
        }

        try {
            const organization = await this.organizationService.create(
                loggedUser,
                organizationToRegister
            );

            return organization;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof OrganizationNameAlreadyTakenError) {
                throw new BadRequestException({ message: error.message });
            }

            if (error instanceof OrganizationDocumentOwnershipMismatchError) {
                throw new ForbiddenException({ message: error.message });
            }

            throw new InternalServerErrorException({
                message: `Unable to register organization due an unknown error`
            });
        }
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    async delete(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<ISuccessResponse> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.organizationService.remove(organizationId);

        return {
            success: true
        };
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    async put(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Body() body: OrganizationUpdateData
    ): Promise<ISuccessResponse> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (organization.status === body.status) {
            throw new BadRequestException(`Organization is already in requested status.`);
        }

        try {
            await this.organizationService.update(organizationId, body.status);
        } catch (error) {
            this.logger.error(error);
            throw new UnprocessableEntityException({
                message: `Entity ${organizationId} could not be updated due to an unknown error`
            });
        }

        return {
            success: true
        };
    }

    @Post(':id/remove-member/:memberId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    async removeMember(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('memberId', new ParseIntPipe()) memberId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        await this.organizationService.removeMember(loggedUser.organizationId, memberId);

        return {
            success: true
        };
    }

    @Put(':id/change-role/:userId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    async changeMemberRole(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('userId', new ParseIntPipe()) memberId: number,
        @Body() { role }: IOrganizationUpdateMemberRole,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        try {
            ensureOrganizationRole(role);
        } catch (e) {
            throw new ForbiddenException();
        }

        await this.organizationService.changeMemberRole(loggedUser.organizationId, memberId, role);

        return {
            success: true
        };
    }

    private ensureOrganizationMemberOrAdmin(user: ILoggedInUser, organizationId: number) {
        const isOrganizationMember = user.organizationId === organizationId;
        const hasAdminRole = isRole(user, Role.Admin, Role.SupportAgent);

        if (hasAdminRole) {
            return;
        }
        if (!isOrganizationMember) {
            throw new ForbiddenException('Not a member of the organization.');
        }
    }
}
