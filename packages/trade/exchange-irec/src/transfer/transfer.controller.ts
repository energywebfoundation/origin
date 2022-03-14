import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    Roles,
    RolesGuard,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    HttpStatus,
    Logger,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IrecRequestClaimDTO } from './dto';
import { CommandBus } from '@nestjs/cqrs';
import { IrecRequestClaimCommand } from './command';

@ApiTags('irec/transfer')
@ApiBearerAuth('access-token')
@Controller('irec/transfer')
@UsePipes(ValidationPipe)
export class IrecTransferController {
    constructor(
        private commandBus: CommandBus
    ) {}

    @Post('claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: IrecRequestClaimDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Request a claim' })
    public async requestClaim(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() claim: IrecRequestClaimDTO
    ): Promise<void> {
        return this.commandBus.execute(new IrecRequestClaimCommand(
            ownerId,
            claim
        ));
        
    }
}
