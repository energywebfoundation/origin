import { KYCStatus, Role, UserStatus } from '@energyweb/origin-backend-core';
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
    ParseIntPipe,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UpdateUserDTO } from './dto/update-user.dto';
import { UserDTO } from '../user/dto/user.dto';

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
    @ApiQuery({
        name: 'orgName',
        description: 'Filter users by organization name',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'status',
        description: 'Filter users by user status',
        required: false,
        enum: UserStatus
    })
    @ApiQuery({
        name: 'kycStatus',
        description: 'Filter users by KYC status',
        required: false,
        enum: KYCStatus
    })
    @ApiResponse({ status: HttpStatus.OK, type: [UserDTO], description: 'Gets all users' })
    public async getUsers(
        @Query('orgName') orgName?: string,
        @Query('status') status?: UserStatus,
        @Query('kycStatus') kycStatus?: KYCStatus
    ): Promise<UserDTO[]> {
        if (!orgName && !status && !kycStatus) {
            return this.userService.getAll({ relations: ['organization'] });
        }

        return this.userService.getUsersBy({
            orgName,
            status,
            kycStatus
        });
    }

    @Put('users/:id')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    @ApiBody({ type: UpdateUserDTO })
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: 'Updates a user (admin)' })
    public async updateUser(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() body: UpdateUserDTO
    ): Promise<UserDTO> {
        return this.userService.update(id, body);
    }
}
