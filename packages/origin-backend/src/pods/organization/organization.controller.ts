import {
    ensureOrganizationRole,
    ILoggedInUser,
    IOrganizationUpdateMemberRole,
    isRole,
    OrganizationUpdateData,
    ResponseFailure,
    ResponseSuccess,
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
    HttpStatus,
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

import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StorageErrors } from '../../enums/StorageErrors';
import { Device } from '../device/device.entity';
import { User } from '../user';
import { NewOrganizationDTO } from './new-organization.dto';
import { OrganizationInvitationDTO } from './organization-invitation.dto';
import { OrganizationService } from './organization.service';
import { FullOrganizationInfoDTO } from './full-organization-info.dto';
import { PublicOrganizationInfoDTO } from './public-organization-info.dto';
import { OrganizationNameAlreadyTakenError } from './organization-name-taken.error';
import { OrganizationDocumentOwnershipMismatchError } from './organization-document-ownership-mismatch.error';
import { SuccessResponseDTO } from '../../utils/success-response.dto';

@ApiTags('organization')
@ApiBearerAuth('access-token')
@Controller('/Organization')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class OrganizationController {
    private logger = new Logger(OrganizationController.name);

    constructor(private readonly organizationService: OrganizationService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [FullOrganizationInfoDTO],
        description: 'Gets all organizations'
    })
    async getAll(): Promise<FullOrganizationInfoDTO[]> {
        const organizations = await this.organizationService.getAll();

        return organizations.map((org) => FullOrganizationInfoDTO.fromPlatformOrganization(org));
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: FullOrganizationInfoDTO,
        description: 'Gets an organization'
    })
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
    @ApiResponse({
        status: HttpStatus.OK,
        type: PublicOrganizationInfoDTO,
        description: 'Gets a public organization'
    })
    async getPublic(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<PublicOrganizationInfoDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        return PublicOrganizationInfoDTO.fromPlatformOrganization(organization);
    }

    @Get('/:id/invitations')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [OrganizationInvitationDTO],
        description: 'Gets invitations for an organization'
    })
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
    @ApiResponse({
        status: HttpStatus.OK,
        type: [User],
        description: 'Gets users of an organization'
    })
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
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Device],
        description: 'Gets devices of an organization'
    })
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
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: FullOrganizationInfoDTO,
        description: 'Register an organization'
    })
    async register(
        @Body() organizationToRegister: NewOrganizationDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<FullOrganizationInfoDTO> {
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
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Delete an organization'
    })
    async delete(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<SuccessResponseDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.organizationService.remove(organizationId);

        return ResponseSuccess();
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Update an organization'
    })
    async update(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Body() body: OrganizationUpdateData
    ): Promise<SuccessResponseDTO> {
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
            throw new UnprocessableEntityException(
                ResponseFailure(
                    `Entity ${organizationId} could not be updated due to an unknown error`
                )
            );
        }

        return ResponseSuccess();
    }

    @Put(':id/remove-member/:memberId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Removes a member from an organization'
    })
    async removeMember(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('memberId', new ParseIntPipe()) memberId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        await this.organizationService.removeMember(loggedUser.organizationId, memberId);

        return ResponseSuccess();
    }

    @Put(':id/change-role/:userId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiParam({ name: 'role', enum: Role, enumName: 'Role' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Removes a member from an organization'
    })
    async changeMemberRole(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('userId', new ParseIntPipe()) memberId: number,
        @Body() { role }: IOrganizationUpdateMemberRole,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        try {
            ensureOrganizationRole(role);
        } catch (e) {
            throw new ForbiddenException();
        }

        await this.organizationService.changeMemberRole(loggedUser.organizationId, memberId, role);

        return ResponseSuccess();
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
