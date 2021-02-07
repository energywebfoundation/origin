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

import { ConnectionDTO, CreateConnectionDTO } from './dto';
import { CreateConnectionCommand, GetConnectionsCommand } from './commands';

@ApiTags('irec_connection')
@ApiBearerAuth('access-token')
@UsePipes(ValidationPipe)
@Controller('irec/connection')
export class ConnectionController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
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
    @Roles(Role.OrganizationAdmin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ConnectionDTO],
        description: 'Get a IREC connection info'
    })
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<ConnectionDTO> {
        return this.commandBus.execute(new GetConnectionsCommand(user));
    }
}
