import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountBalanceDTO } from './account-balance.dto';
import { AccountBalanceService } from './account-balance.service';

@ApiTags('account-balance')
@ApiBearerAuth('access-token')
@Controller('account-balance')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class AccountBalanceController {
    constructor(private readonly accountBalanceService: AccountBalanceService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: AccountBalanceDTO,
        description: 'Get the Account Balance'
    })
    public async get(@UserDecorator() user: ILoggedInUser): Promise<AccountBalanceDTO> {
        return this.accountBalanceService.getAccountBalance(user.ownerId);
    }
}
