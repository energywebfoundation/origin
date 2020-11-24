import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
    ValidationPipe,
    UsePipes,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: AccountDTO, description: 'Get the Account' })
    public async getAccount(@UserDecorator() user: ILoggedInUser): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(user.ownerId.toString());

        return account;
    }
}
