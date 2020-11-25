import {
    ensureOrganizationRole,
    ILoggedInUser,
    IOrganizationInvitation,
    OrganizationInvitationStatus,
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
    ForbiddenException,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isEmail } from 'class-validator';

import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { AlreadyPartOfOrganizationError } from './errors/already-part-of-organization.error';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { InvitationDTO } from './invitation.dto';
import { InviteDTO } from './invite.dto';

@ApiTags('invitation')
@ApiBearerAuth('access-token')
@Controller('/invitation')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class InvitationController {
    private logger = new Logger(InvitationController.name);

    constructor(private readonly organizationInvitationService: InvitationService) {}

    @Get()
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [InvitationDTO],
        description: 'Gets all invitations for a user'
    })
    async getInvitations(@UserDecorator() loggedUser: ILoggedInUser): Promise<InvitationDTO[]> {
        const invitations = await this.organizationInvitationService.getUsersInvitation(
            loggedUser.email
        );

        return invitations;
    }

    @Put(':id/:status')
    @UseGuards(AuthGuard())
    @ApiParam({
        name: 'status',
        enum: OrganizationInvitationStatus,
        enumName: 'OrganizationInvitationStatus'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Updates an invitation'
    })
    async updateInvitation(
        @Param('id') invitationId: string,
        @Param('status') status: IOrganizationInvitation['status'],
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        return this.organizationInvitationService.update(loggedUser, invitationId, status);
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiBody({ type: InviteDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SuccessResponseDTO,
        description: 'Invites a user'
    })
    async invite(
        @Body() dto: InviteDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        if (!isEmail(dto.email)) {
            throw new BadRequestException(ResponseFailure('Provided email address is incorrect'));
        }

        if (!loggedUser.hasOrganization) {
            throw new BadRequestException(
                ResponseFailure(`User doesn't belong to any organization.`)
            );
        }

        try {
            ensureOrganizationRole(dto.role);
        } catch (e) {
            throw new ForbiddenException(
                ResponseFailure('Unknown role was requested for the invitee')
            );
        }

        try {
            await this.organizationInvitationService.invite(loggedUser, dto.email, dto.role);
        } catch (error) {
            this.logger.error(error.toString());

            if (error instanceof AlreadyPartOfOrganizationError) {
                throw new ForbiddenException({ message: error.message });
            }
        }

        return ResponseSuccess();
    }
}
