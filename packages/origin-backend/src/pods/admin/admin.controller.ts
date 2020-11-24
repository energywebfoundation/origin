import { IUserFilter, Role } from '@energyweb/origin-backend-core';
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
    HttpStatus,
    Param,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDTO } from '../user/user.dto';

import { UserService } from '../user/user.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class AdminController {
    constructor(private readonly userService: UserService) {}

    @Get('users')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    @ApiResponse({ status: HttpStatus.OK, type: [UserDTO], description: 'Gets all users' })
    public async getUsers(@Query() filter?: IUserFilter): Promise<UserDTO[]> {
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
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: 'Updates a user' })
    public async updateUser(
        @Param('id') id: string,
        @Body() body: Partial<UserDTO>
    ): Promise<UserDTO> {
        return this.userService.update(id, body);
    }
}
