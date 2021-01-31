import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateConnectionCommand } from './commands/create-connection.command';
import { ConnectionDTO } from './dto/connection.dto';
import { CreateConnectionDTO } from './dto/create-connection.dto';

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
}
