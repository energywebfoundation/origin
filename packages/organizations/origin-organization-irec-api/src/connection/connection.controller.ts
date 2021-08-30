import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateConnectionDTO } from '../irec';
import { ConnectionDTO } from './dto';
import { CreateConnectionCommand, GetConnectionCommand } from './commands';

@ApiTags('irec-connection')
@ApiBearerAuth('access-token')
@UsePipes(ValidationPipe)
@Controller('irec/connection')
export class ConnectionController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiBody({ type: CreateConnectionDTO })
    @ApiCreatedResponse({
        type: ConnectionDTO,
        description: 'Creates a connection to I-REC'
    })
    public async register(
        @UserDecorator() user: ILoggedInUser,
        @Body() credentials: CreateConnectionDTO
    ): Promise<ConnectionDTO> {
        return this.commandBus.execute(new CreateConnectionCommand(user, credentials));
    }

    @Get()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ConnectionDTO],
        description: 'Get a IREC connection info'
    })
    public async getMyConnection(@UserDecorator() user: ILoggedInUser): Promise<ConnectionDTO> {
        return this.commandBus.execute(new GetConnectionCommand(user));
    }
}
