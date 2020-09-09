import { LoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectDTO } from './connect.dto';
import { Connect } from './connect.entity';
import { ConnectService } from './connect.service';

@Controller('irec/connect')
export class ConnectController {
    constructor(private readonly connectService: ConnectService) {}

    @Get()
    @UseGuards(AuthGuard())
    public getRequests(@UserDecorator() loggedInUser: LoggedInUser): Promise<Connect[]> {
        const isAdmin = loggedInUser.hasRole(Role.Admin, Role.SupportAgent);

        return this.connectService.find(isAdmin ? null : loggedInUser.organizationId.toString());
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
    public async register(
        @UserDecorator() loggedInUser: LoggedInUser,
        @Body() connect: ConnectDTO
    ): Promise<{ id: string }> {
        const id = await this.connectService.register(
            loggedInUser.organizationId.toString(),
            connect
        );

        return { id };
    }
}
