import {
    ILoggedInUser,
    IOrganizationInvitation,
    ISuccessResponse,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';
import { ActiveUserGuard, Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Put,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isEmail } from 'class-validator';

import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.entity';

@Controller('/invitation')
export class InvitationController {
    private logger = new Logger(InvitationController.name);

    constructor(private readonly organizationInvitationService: InvitationService) {}

    @Get()
    @UseGuards(AuthGuard())
    async getInvitations(@UserDecorator() loggedUser: ILoggedInUser): Promise<Invitation[]> {
        const invitations = await this.organizationInvitationService.getUsersInvitation(
            loggedUser.email
        );

        return invitations;
    }

    @Put(':id')
    @UseGuards(AuthGuard())
    async updateInvitation(
        @Body('status') status: IOrganizationInvitation['status'],
        @Param('id') invitationId: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        await this.organizationInvitationService.update(loggedUser, invitationId, status);
        return true;
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    async invite(
        @Body('email') email: string,
        @Body('role') role: OrganizationRole,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        if (!isEmail(email)) {
            throw new BadRequestException({
                success: false,
                error: 'Provided email address is incorrect'
            });
        }

        if (typeof loggedUser.organizationId === 'undefined') {
            throw new BadRequestException({
                success: false,
                message: `User doesn't belong to any organization.`
            });
        }

        await this.organizationInvitationService.invite(loggedUser, email, role);

        return {
            success: true,
            message: null
        };
    }
}
