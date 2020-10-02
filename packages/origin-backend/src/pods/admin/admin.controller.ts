import { IUser, IUserFilter, Role } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from '../user/user.service';

@Controller('admin')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class AdminController {
    constructor(private readonly userService: UserService) {}

    @Get('users')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    public async getUsers(@Query() filter?: IUserFilter) {
        if (Object.keys(filter).length === 0) {
            return this.userService.getAll({ relations: ['organization'] });
        }

        const { status, kycStatus } = filter;

        const cleanFilter = {
            ...filter,
            status: status ? Number(status) : status,
            kycStatus: kycStatus ? Number(kycStatus) : kycStatus
        };

        return this.userService.getUsersBy(cleanFilter);
    }

    @Put('users/:id')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    public async put(@Param('id') id: string, @Body() body: IUser) {
        return this.userService.update(id, body);
    }
}
